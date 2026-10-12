"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children?: ReactNode;
}

const baseClasses =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-[#1d4a32] text-white shadow-md hover:bg-[#163826] dark:bg-emerald-500 dark:text-zinc-950",
  secondary:
    "glass-surface text-emerald-800 hover:bg-emerald-50/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={isDisabled}
      {...props}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
      {isLoading && <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
