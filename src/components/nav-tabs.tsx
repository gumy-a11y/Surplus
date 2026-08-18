"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/mes-objets", label: "Mes objets" },
  { href: "/abonnements", label: "Abonnements" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-[22px] flex w-fit gap-0.5 overflow-hidden rounded-[2px] border border-card-border">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-r border-card-border px-4 py-2.5 font-mono text-xs tracking-wide uppercase last:border-r-0 ${
              active
                ? "bg-orange font-semibold text-blueprint-deep"
                : "text-ink-dim hover:bg-ink/6 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
