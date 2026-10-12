"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Backpack, Loader2, MapPinned, Route, ShieldCheck } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Card } from "@/components/ui/Card";
import { StaggerText } from "@/components/ui/StaggerText";
import { signInWithGoogle } from "@/lib/auth-actions";

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
  const signInAction = signInWithGoogle.bind(null, redirectTo);

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
        text="Welcome to Trip Planner"
        delay={0.35}
        className="mt-6 text-3xl font-bold tracking-tight text-balance"
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
        className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
      >
        Sign in to check landslide risk and build a personalized outdoor itinerary.
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

      <motion.form
        action={signInAction}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.7 }}
        className="mt-8"
      >
        <GoogleButton />
      </motion.form>

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
        only so a plan can be tied to you. We keep your last 3 plans. Download a plan if you want
        to keep it, because older ones are deleted. The challenge is open to people 18 and older.
      </p>
    </Card>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={pending ? undefined : { y: -2, scale: 1.01 }}
      whileTap={pending ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-shadow hover:shadow-lg hover:shadow-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:shadow-emerald-400/10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {pending ? (
        <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleLogo className="relative h-5 w-5" />
      )}
      <span className="relative">{pending ? "Redirecting to Google…" : "Sign in with Google"}</span>
    </motion.button>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
