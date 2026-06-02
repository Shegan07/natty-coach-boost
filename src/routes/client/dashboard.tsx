import { useEffect, useState, type ComponentType } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dumbbell, FileText, LineChart, LogOut, Salad } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import {
  getClientRecordForProfile,
  getClientSummary,
  getDietPlansForClient,
  getFilesForClient,
  getProgressLogsForClient,
  getWorkoutPlansForClient,
  type ClientRecord,
  type ClientSummary,
  type DietPlanRecord,
  type FileRecord,
  type ProgressLogRecord,
  type WorkoutPlanRecord,
} from "@/lib/supabase/trainer-system";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";

export const Route = createFileRoute("/client/dashboard")({
  component: ClientDashboard,
});

function ClientDashboard() {
  const navigate = useNavigate();
  const { loading, profile, email } = useDashboardAccess("client");
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanRecord[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlanRecord[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLogRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
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
        const record = await getClientRecordForProfile(profile);

        if (!active) return;

        setClientRecord(record);

        if (!record) {
          setPageLoading(false);
          return;
        }

        const [summaryData, workoutData, dietData, progressData, fileData] = await Promise.all([
          getClientSummary(record.id),
          getWorkoutPlansForClient(record.id),
          getDietPlansForClient(record.id),
          getProgressLogsForClient(record.id),
          getFilesForClient(record.id),
        ]);

        if (!active) return;

        setSummary(summaryData);
        setWorkoutPlans(workoutData);
        setDietPlans(dietData);
        setProgressLogs(progressData);
        setFiles(fileData);
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
        Loading client dashboard...
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

  if (!clientRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg border-silver/20 bg-card/80">
          <CardHeader>
            <CardTitle>Profile setup needed</CardTitle>
            <CardDescription>
              Your account is signed in, but it has not been linked to a trainer client record yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Ask your trainer to add you as a client and link your email address to the client
              record.
            </p>
            <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      roleLabel="CLIENT DASHBOARD"
      title={profile?.name ?? "CLIENT"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/client/dashboard", label: "Dashboard", icon: Salad },
        { to: "/client/workouts", label: "Workouts", icon: Dumbbell },
        { to: "/client/diets", label: "Diet", icon: Salad },
        { to: "/client/progress", label: "Progress", icon: LineChart },
        { to: "/client/files", label: "Files", icon: FileText },
      ]}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-xl border border-border bg-card/80 p-5 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.3em] text-silver-muted">CLIENT OVERVIEW</p>
            <h1 className="font-display text-4xl sm:text-5xl text-silver-gradient leading-[0.95]">
              Your private dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              View plans, track progress, and keep your shared files in one place.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Current Workout Plan"
            value={summary?.workoutPlans ?? 0}
            icon={Dumbbell}
          />
          <MetricCard label="Current Diet Plan" value={summary?.dietPlans ?? 0} icon={Salad} />
          <MetricCard
            label="Latest Progress"
            value={summary?.latestProgress?.weight ? 1 : 0}
            icon={LineChart}
            helper={summary?.latestProgress?.log_date ?? "No logs yet"}
          />
          <MetricCard label="Uploaded Files" value={summary?.files ?? 0} icon={FileText} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Workout Plan</CardTitle>
              <CardDescription>Your active training assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workoutPlans.length ? (
                workoutPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-md border border-border bg-background/60 px-4 py-3 text-sm"
                  >
                    <div className="font-medium text-foreground">{plan.title}</div>
                    <div className="mt-1 text-muted-foreground">{plan.schedule}</div>
                  </div>
                ))
              ) : (
                <EmptyState text="No workout plan assigned yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Diet Plan</CardTitle>
              <CardDescription>Your current nutrition assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dietPlans.length ? (
                dietPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-md border border-border bg-background/60 px-4 py-3 text-sm"
                  >
                    <div className="font-medium text-foreground">{plan.title}</div>
                    <div className="mt-1 text-muted-foreground">{plan.schedule}</div>
                  </div>
                ))
              ) : (
                <EmptyState text="No diet plan assigned yet." />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Progress</CardTitle>
              <CardDescription>Your recent body and scale updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressLogs.length ? (
                progressLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <div className="font-medium text-foreground">{log.log_date}</div>
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
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>Files shared by your trainer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.length ? (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{file.file_name}</div>
                      <div className="text-muted-foreground">{file.mime_type ?? "File"}</div>
                    </div>
                    <DownloadFileButton file={file} />
                  </div>
                ))
              ) : (
                <EmptyState text="No files shared yet." />
              )}
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
  helper,
  icon: Icon,
}: {
  label: string;
  value: number;
  helper?: string;
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
      <CardContent className="space-y-2">
        <div className="font-display text-4xl text-silver-gradient">{value}</div>
        {helper ? <div className="text-sm text-muted-foreground">{helper}</div> : null}
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

function DownloadFileButton({ file }: { file: FileRecord }) {
  const [href, setHref] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadLink() {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_id)
        .createSignedUrl(file.file_path, 60 * 60);
      if (error) {
        throw error;
      }
      setHref(data.signedUrl);
    } finally {
      setLoading(false);
    }
  }

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-md border border-silver/40 px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors"
    >
      Open
    </a>
  ) : (
    <Button type="button" variant="outline" onClick={loadLink} disabled={loading}>
      {loading ? "Loading..." : "Open"}
    </Button>
  );
}
