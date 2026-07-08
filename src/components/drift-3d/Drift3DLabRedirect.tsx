"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Le lab 3D est passé en production sur /drift. Export statique oblige,
 * la redirection est faite côté client, avec un lien de secours visible.
 */
export default function Drift3DLabRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/drift");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090d] p-6 text-neutral-200">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em]">
        Le monde Drift a déménagé —{" "}
        <Link href="/drift" className="underline hover:text-white">
          entrer
        </Link>
      </p>
    </main>
  );
}
