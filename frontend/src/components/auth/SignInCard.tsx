"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Backpack, MapPinned, Route, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { StaggerText } from "@/components/ui/StaggerText";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const highlights = [
  { Icon: ShieldCheck, text: "Simulated landslide risk checks for your dates" },
  { Icon: Route, text: "Day by day itineraries shaped around you" },
  { Icon: Backpack, text: "Packing lists and safety notes built in" },
];

interface SignInCardProps {
  redirectTo: string;
  errorMessage?: string;
}

export function SignInCard({ redirectTo, errorMessage }: SignInCardProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function signInWith(provider: "google" | "github") {
    if (!isSupabaseConfigured()) {
      setMessage("Supabase login is not set on this server yet. You can go back and generate a plan.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "https://opentrips.ashwintemkar.com/auth/callback",
      },
    });
    if (error) setMessage(error.message);
  }

  return (
    <Card className="w-full max-w-md p-8 text-center sm:p-10" delay={0.1}>
      <div className="relative mx-auto h-16 w-16">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400"
          animate={{ scale: [1, 1.35], opacity: [0.45, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/30 dark:from-emerald-400 dark:to-teal-400 dark:shadow-emerald-400/20"
        >
          <MapPinned className="h-8 w-8 text-white dark:text-zinc-950" aria-hidden="true" />
        </motion.span>
      </div>

      <StaggerText
        text="Sign in to continue"
        delay={0.35}
        className="mt-6 text-3xl font-bold tracking-tight text-balance"
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
        className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
      >
        Your trip details are saved on this page. Sign in to see the result. Use Google or GitHub.
      </motion.p>

      <AnimatePresence>
        {errorMessage && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {message && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p>
      )}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={() => signInWith("google")}
          className="flex w-full items-center justify-center rounded-full bg-[#1d4a32] px-5 py-3 text-sm font-semibold text-white"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signInWith("github")}
          className="flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Continue with GitHub
        </button>
      </div>

      <ul className="mt-8 space-y-3 text-left">
        {highlights.map(({ Icon, text }, index) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.85 + index * 0.08 }}
            className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {text}
          </motion.li>
        ))}
      </ul>

      <p className="mt-8 text-xs leading-5 text-zinc-500 dark:text-zinc-500">
        OpenTrips is an open source project for the Hacktoberfest challenge. It is not a commercial
        app, and we do not sell data. Signing in stores your Google name, email, and profile photo
        or your GitHub name and email, only so a plan can be tied to you. We keep your last 3 plans. Download a plan if you want
        to keep it, because older ones are deleted. The challenge is open to people 18 and older.
      </p>
    </Card>
  );
}
