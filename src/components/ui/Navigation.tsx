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
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md">
        <Link
          href="/"
          className="mr-4 text-sm font-semibold tracking-tight text-white/90 transition hover:text-white"
        >
          MISWΛY
        </Link>

        <div className="mx-2 h-3 w-px bg-white/20" />

        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-md px-3 py-1 text-[11px] font-mono tracking-[0.22em] transition-colors",
                isActive ? "text-white" : "text-neutral-500 hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute inset-0 -z-10 rounded-md bg-white/10"
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                />
              )}
              {link.label}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}