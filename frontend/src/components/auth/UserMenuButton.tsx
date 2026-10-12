"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface UserMenuButtonProps {
  name: string;
  email: string;
  image: string | null;
}

export function UserMenuButton({ name, email, image }: UserMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        aria-label={`Account menu for ${name}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:from-emerald-400 dark:to-teal-400"
      >
        <Avatar name={name} image={image} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top right" }}
            className="glass-surface absolute right-0 mt-3 w-64 rounded-2xl p-2 shadow-xl shadow-black/10 dark:shadow-black/40"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-10 w-10 shrink-0 rounded-full">
                <Avatar name={name} image={image} />
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{name}</p>
                {email && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>}
              </div>
            </div>
            <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured()) {
                  await createSupabaseBrowserClient().auth.signOut();
                }
                window.location.href = "/";
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-red-500/10 hover:text-red-700 dark:text-zinc-300 dark:hover:bg-red-400/10 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={40}
        height={40}
        className="h-full w-full rounded-full bg-white object-cover dark:bg-zinc-900"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
