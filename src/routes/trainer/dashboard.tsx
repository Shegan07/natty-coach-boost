import { useEffect, useState, type ComponentType } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileChartColumn, LogOut, Sparkles, Users, Zap } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import {
  getProgressLogsForTrainer,
  getTrainerSummary,
  type ProgressLogRecord,
  type TrainerSummary,
} from "@/lib/supabase/trainer-system";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";

export const Route = createFileRoute("/trainer/dashboard")({
  component: TrainerDashboard,
});

function TrainerDashboard() {
  const navigate = useNavigate();
  const { loading, profile, email } = useDashboardAccess("trainer");
  const [summary, setSummary] = useState<TrainerSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<ProgressLogRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const [summaryData, logs] = await Promise.all([
          getTrainerSummary(profile.id),
          getProgressLogsForTrainer(profile.id),
        ]);

        if (!active) return;

        setSummary(summaryData);
        setRecentLogs(logs.slice(0, 4));
      } catch (fetchError) {
        if (!active) return;
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data.",
        );
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (loading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Loading trainer dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <DashboardLayout
      roleLabel="TRAINER DASHBOARD"
      title={profile?.name ?? "TRAINER"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/trainer/dashboard", label: "Dashboard", icon: Sparkles },
        { to: "/trainer/clients", label: "Clients", icon: Users },
        { to: "/trainer/workouts", label: "Workouts", icon: FileChartColumn },
        { to: "/trainer/diets", label: "Diets", icon: FileChartColumn },
        { to: "/trainer/progress", label: "Progress", icon: Zap },
        { to: "/trainer/files", label: "Files", icon: FileChartColumn },
      ]}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <header className="flex flex-col gap-3 rounded-lg border border-border/50 bg-card/50 p-4 shadow-sm sm:rounded-xl sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs tracking-[0.3em] text-silver-muted">TRAINER</p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver-gradient leading-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Track clients, plans, and progress
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignOut} 
            disabled={signingOut}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </header>

        <section className="grid gap-2 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <MetricCard label="Clients" value={summary?.totalClients ?? 0} icon={Users} />
          <MetricCard
            label="Workouts"
            value={summary?.activeWorkoutPlans ?? 0}
            icon={FileChartColumn}
          />
          <MetricCard
            label="Diets"
            value={summary?.activeDietPlans ?? 0}
            icon={FileChartColumn}
          />
          <MetricCard
            label="Logs"
            value={summary?.recentProgressLogs ?? 0}
            icon={Zap}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Recent Logs</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest from clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {recentLogs.length ? (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-md border border-border/50 bg-background/40 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground"
                  >
                    <div className="font-medium text-foreground text-sm sm:text-base">
                      {log.client?.name ?? "Unknown"} - {log.log_date}
                    </div>
                    <div className="mt-1 text-xs">
                      {log.weight && `${log.weight}lbs`}
                      {log.body_fat && ` | ${log.body_fat}%`}
                      {log.waist && ` | ${log.waist}"`}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No progress logs yet." />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Fast access to tools</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:gap-3 grid-cols-2">
              {[
                { to: "/trainer/clients", label: "Clients" },
                { to: "/trainer/workouts", label: "Workouts" },
                { to: "/trainer/diets", label: "Diets" },
                { to: "/trainer/files", label: "Files" },
              ].map((item) => (
                <Button
                  key={item.to}
                  type="button"
                  variant="outline"
                  asChild
                  className="h-auto justify-center px-2 py-2 sm:py-3 text-xs sm:text-sm"
                >
                  <Link to={item.to}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/50 bg-card/40">
      <CardHeader className="space-y-2 pb-2 sm:space-y-3 sm:pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-silver/30 bg-secondary/50">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-silver" />
        </div>
        <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 sm:space-y-2 sm:pt-1">
        <div className="font-display text-2xl sm:text-3xl md:text-4xl text-silver-gradient">{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
