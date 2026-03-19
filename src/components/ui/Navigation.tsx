"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "EXPLORE" },
  { href: "/tracks", label: "TRACKS" },
  { href: "/drift", label: "DRIFT" },
  { href: "/about", label: "INFO" },
  { href: "/contact", label: "CONTACT" },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1rem)] max-w-[720px] -translate-x-1/2 sm:bottom-6 sm:w-auto"
    >
      <div className="rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md sm:rounded-full sm:px-4 sm:py-2">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:items-center sm:gap-1">
          <Link
            href="/"
            className="col-span-2 flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-center text-sm font-semibold tracking-tight text-white/90 transition hover:text-white sm:col-span-1 sm:mr-4 sm:min-h-0 sm:rounded-full sm:border-0 sm:px-0 sm:py-0 sm:text-sm"
          >
            MISWΛY
          </Link>

          <div className="hidden sm:mx-2 sm:block sm:h-3 sm:w-px sm:bg-white/20" />

          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex min-h-[42px] items-center justify-center rounded-xl border px-3 py-2 text-center text-[10px] font-mono tracking-[0.14em] transition-colors sm:min-h-0 sm:rounded-md sm:border-transparent sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.22em]",
                  isActive
                    ? "border-white/20 text-white"
                    : "border-white/10 text-neutral-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-xl bg-white/10 sm:rounded-md"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}