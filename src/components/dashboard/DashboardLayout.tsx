import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export type DashboardLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type DashboardLayoutProps = {
  roleLabel: string;
  title: string;
  subtitle?: string;
  links: DashboardLink[];
  children: ReactNode;
};

export function DashboardLayout({
  roleLabel,
  title,
  subtitle,
  links,
  children,
}: DashboardLayoutProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-xl border border-border bg-card/80 p-4 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="border-b border-border pb-4">
            <div className="text-xs tracking-[0.3em] text-silver-muted">{roleLabel}</div>
            <div className="mt-2 font-display text-2xl text-silver-gradient leading-none">
              {title}
            </div>
            {subtitle ? <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div> : null}
          </div>

          <nav className="mt-4 grid gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                    active
                      ? "border-silver/40 bg-secondary text-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:border-silver/20 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 text-silver" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
