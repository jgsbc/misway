"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { House, AudioLines, Waves, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/tracks", label: "Tracks", icon: AudioLines },
  { href: "/drift", label: "Drift", icon: Waves },
  { href: "/about", label: "About", icon: Info },
];

function isDrift3DLabPath(pathname: string | null) {
  if (!pathname) return false;

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  // le monde 3D plein écran vit désormais sur /drift (l'ancien lab redirige)
  return /(^|\/)(drift|drift-3d-lab)(\/|$)/.test(normalizedPathname);
}

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/" || isDrift3DLabPath(pathname)) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-[52px] left-1/2 z-40 -translate-x-1/2 sm:bottom-[58px]"
      aria-label="Primary navigation"
    >
      <div className="rounded-full border border-neutral-300 bg-white/85 px-2 py-2 shadow-[0_0_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
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
                  "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:h-11 sm:w-11",
                  isActive
                    ? "border-neutral-400 text-neutral-900"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-full bg-neutral-200"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                )}
                <Icon className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]" strokeWidth={1.8} />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
