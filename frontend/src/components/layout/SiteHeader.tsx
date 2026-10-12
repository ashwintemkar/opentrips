"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { MapPinned } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils/cn";

export function SiteHeader({ userMenu }: { userMenu?: ReactNode }) {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setIsScrolled(value > 8));

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300",
        isScrolled
          ? "border-black/10 bg-white/80 shadow-lg shadow-black/[0.04] dark:border-white/10 dark:bg-zinc-950/75 dark:shadow-black/40"
          : "border-transparent bg-white/50 dark:bg-zinc-950/40",
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 dark:from-emerald-400 dark:to-teal-400 dark:shadow-emerald-400/20"
          >
            <MapPinned className="h-5 w-5 text-white dark:text-zinc-950" aria-hidden="true" />
          </motion.span>
          <span className="text-lg font-semibold tracking-tight text-[#163226] dark:text-zinc-50">
            OpenTrips
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <p className="hidden text-sm text-zinc-500 lg:block dark:text-zinc-400">
            A short plan, then go outside
          </p>
          <ThemeToggle />
          {userMenu}
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400"
      />
    </motion.header>
  );
}
