"""OpenTrips API: /risk (TabPFN landslide/rain risk) and /plan (Tinker
fine-tuned trip planner). This is the contract Kiran's Next.js app calls.
"""
import json
import os
import re

import pandas as pd
import requests
import tinker
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from tabpfn_client import TabPFNClassifier
from tinker import types

from prompt_format import extract_first_json, wrap_prompt
from rule_checker import check_plan

load_dotenv()

app = FastAPI(title="OpenTrips API")

# --- TabPFN risk model, trained once at startup -----------------------
FEATURES = ["rain_1d", "rain_3d", "rain_7d", "rain_14d", "lat", "lon"]
_df = pd.read_csv("landslide_dataset.csv")
_tabpfn = TabPFNClassifier()
_tabpfn.fit(_df[FEATURES].fillna(0), _df["label"])
# Paste the GEO-split accuracy from train_tabpfn.py's output here.
MODEL_ACCURACY = float(os.environ.get("MODEL_ACCURACY", "0.0"))

# --- Tinker sampling client for the fine-tuned plan model --------------
_BASE_MODEL = "Qwen/Qwen3-8B"
_CHECKPOINT_PATH = os.environ.get("PLAN_CHECKPOINT_PATH", "")
_service = tinker.ServiceClient()
_tokenizer = _service.create_lora_training_client(base_model=_BASE_MODEL, rank=16).get_tokenizer()
_sampling_client = None
if _CHECKPOINT_PATH:
    _sampling_client = _service.create_sampling_client(model_path=_CHECKPOINT_PATH)


class RiskReq(BaseModel):
    lat: float
    lon: float
    start_date: str
    end_date: str


@app.post("/risk")
def risk(req: RiskReq):
    try:
        r = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": req.lat, "longitude": req.lon,
                "start_date": req.start_date, "end_date": req.end_date,
                "daily": "precipitation_sum", "timezone": "UTC",
            },
            timeout=20,
        ).json()
    except requests.RequestException:
        r = {}
    daily = r.get("daily") or {}
    precip = [p for p in (daily.get("precipitation_sum") or []) if p is not None]
    rain_total = sum(precip) if precip else 0.0

    rain_1d = precip[0] if precip else 0
    rain_3d = sum(precip[:3]) if precip else 0
    rain_7d = sum(precip[:7]) if precip else 0
    rain_14d = rain_total

    feats = pd.DataFrame([{
        "rain_1d": rain_1d,
        "rain_3d": rain_3d,
        "rain_7d": rain_7d,
        "rain_14d": rain_14d,
        "lat": req.lat, "lon": req.lon,
    }])
    proba = float(_tabpfn.predict_proba(feats)[0][1])
    verdict = "wait" if proba > 0.6 else "caution" if proba > 0.3 else "go"
    return {
        "risk": proba, "verdict": verdict,
        # Real rolling rainfall windows, the same features TabPFN sees, not
        # fabricated UI filler. rain_mm_forecast kept for backward compat,
        # equal to rain_14d (the full requested window).
        "rain_1d": rain_1d, "rain_3d": rain_3d, "rain_7d": rain_7d, "rain_14d": rain_14d,
        "rain_mm_forecast": rain_total, "model_accuracy": MODEL_ACCURACY,
    }


_LOW_ABILITY_KEYWORDS = (
    "beginner", "elderly", "kid", "child", "toddler", "knee", "asthma",
    "pregnan", "wheelchair", "injury",
)
_HIGH_ABILITY_KEYWORDS = ("advanced", "experienced", "expert")


def extract_check_limits(request_text: str) -> tuple[float, float]:
    """Pulls a max budget and a max per-day distance out of the free-text
    request, the same two numbers rule_checker.py needs to score the plan.
    This mirrors the hand-written heuristic used for compare_plans.py, it's
    an explicit rule, not a model, that's the point of a rule checker.
    """
    budget_match = re.search(r"budget[^\d]{0,12}(\d{3,6})", request_text, re.IGNORECASE)
    max_budget = float(budget_match.group(1)) if budget_match else float(
        os.environ.get("DEFAULT_MAX_BUDGET", "10000")
    )
    text_lower = request_text.lower()
    if any(k in text_lower for k in _LOW_ABILITY_KEYWORDS):
        max_distance_km = 8.0
    elif any(k in text_lower for k in _HIGH_ABILITY_KEYWORDS):
        max_distance_km = 25.0
    else:
        max_distance_km = 15.0
    return max_budget, max_distance_km


class PlanReq(BaseModel):
    request_text: str
    lat: float
    lon: float
    start_date: str
    end_date: str
    risk: float


@app.post("/plan")
async def plan(req: PlanReq):
    if _sampling_client is None:
        return {"error": "PLAN_CHECKPOINT_PATH not set yet, run train_plan_model.py first"}
    prompt_tokens = _tokenizer.encode(wrap_prompt(req.request_text))
    result = await _sampling_client.sample_async(
        prompt=types.ModelInput.from_ints(prompt_tokens),
        num_samples=1,
        sampling_params=types.SamplingParams(max_tokens=400, temperature=0.3),
    )
    raw_text = _tokenizer.decode(result.sequences[0].tokens, skip_special_tokens=True)
    json_text = extract_first_json(raw_text)
    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError:
        return {"raw": raw_text, "parse_error": True}

    max_budget, max_distance_km = extract_check_limits(req.request_text)
    check = check_plan(json_text, max_budget, max_distance_km)
    parsed["checks_passed"] = check["passed"]
    parsed["checks"] = check
    return parsed


@app.get("/healthz")
def healthz():
    return {"status": "ok", "model_accuracy": MODEL_ACCURACY, "checkpoint_loaded": _sampling_client is not None}
