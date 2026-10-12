import type { RiskVerdict } from "@/types/risk";

const copy: Record<RiskVerdict, { title: string; line: string }> = {
  GO: {
    title: "Go outside",
    line: "You have the plan. Download it if you want, then put the phone away.",
  },
  CAUTION: {
    title: "Go, but keep it short",
    line: "Read the warning once. Then leave the screen and take the easier path.",
  },
  WAIT: {
    title: "Not this weekend",
    line: "The useful move is to stay in. Close this and try another day.",
  },
};

export function GoOutsideNote({ verdict }: { verdict: RiskVerdict }) {
  const note = copy[verdict];
  return (
    <div className="rounded-[28px] bg-[#1d4a32] px-6 py-5 text-white">
      <p className="text-xs tracking-wide uppercase text-emerald-100">Touch grass</p>
      <h2 className="mt-1 text-2xl font-semibold">{note.title}</h2>
      <p className="mt-2 text-sm leading-6 text-emerald-50">{note.line}</p>
    </div>
  );
}
