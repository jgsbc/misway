"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { House, Compass, AudioLines, Waves, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/tracks", label: "Tracks", icon: AudioLines },
  { href: "/drift", label: "Drift", icon: Waves },
  { href: "/about", label: "Info", icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/") return null;
  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 sm:bottom-6"
      aria-label="Primary navigation"
    >
      <div className="rounded-full border border-white/10 bg-black/60 px-2 py-2 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");

            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                title={link.label}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                  "sm:h-12 sm:w-12",
                  isActive
                    ? "border-white/20 text-white"
                    : "border-transparent text-neutral-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.8} />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}