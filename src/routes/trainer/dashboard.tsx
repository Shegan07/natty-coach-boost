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
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-xl border border-border bg-card/80 p-5 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.3em] text-silver-muted">TRAINER OVERVIEW</p>
            <h1 className="font-display text-4xl sm:text-5xl text-silver-gradient leading-[0.95]">
              Practice dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Track clients, plans, and progress from one place.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Clients" value={summary?.totalClients ?? 0} icon={Users} />
          <MetricCard
            label="Active Workout Plans"
            value={summary?.activeWorkoutPlans ?? 0}
            icon={FileChartColumn}
          />
          <MetricCard
            label="Active Diet Plans"
            value={summary?.activeDietPlans ?? 0}
            icon={FileChartColumn}
          />
          <MetricCard
            label="Recent Progress Logs"
            value={summary?.recentProgressLogs ?? 0}
            icon={Zap}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Progress Logs</CardTitle>
              <CardDescription>Latest entries from your client base.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLogs.length ? (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <div className="font-medium text-foreground">
                      {log.client?.name ?? "Unknown client"} - {log.log_date}
                    </div>
                    <div className="mt-1">
                      Weight {log.weight ?? "-"} | Body fat {log.body_fat ?? "-"} | Waist{" "}
                      {log.waist ?? "-"}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No progress logs yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcuts to the backend-connected trainer tools.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { to: "/trainer/clients", label: "Manage clients" },
                { to: "/trainer/workouts", label: "Build workouts" },
                { to: "/trainer/diets", label: "Build diets" },
                { to: "/trainer/files", label: "Upload files" },
              ].map((item) => (
                <Button
                  key={item.to}
                  type="button"
                  variant="outline"
                  asChild
                  className="justify-between"
                >
                  <Link to={item.to}>
                    {item.label}
                    <ArrowRight className="h-4 w-4" />
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
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-silver/30 bg-secondary">
          <Icon className="h-5 w-5 text-silver" />
        </div>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="font-display text-4xl text-silver-gradient">{value}</CardContent>
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
