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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-border bg-card/80">
        <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-border bg-card/80 p-4 shadow-sm m-4">
          <div className="border-b border-border pb-4">
            <div className="text-xs tracking-[0.3em] text-silver-muted">{roleLabel}</div>
            <div className="mt-2 font-display text-xl text-silver-gradient leading-none">
              {title}
            </div>
            {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
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
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full lg:ml-64 mb-20 lg:mb-0">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
        <div className="grid h-16 grid-cols-5 items-center justify-items-center gap-px">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-silver" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-none truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
