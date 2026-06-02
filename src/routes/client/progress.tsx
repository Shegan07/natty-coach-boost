import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  createProgressLog,
  getClientRecordForProfile,
  getProgressLogsForClient,
  type ClientRecord,
  type ProgressLogRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/client/progress")({
  component: ClientProgressPage,
});

function ClientProgressPage() {
  const { loading, profile, email } = useDashboardAccess("client");
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [logs, setLogs] = useState<ProgressLogRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

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
        const data = await getProgressLogsForClient(record.id);
        if (!active) return;
        setLogs(data);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load progress.");
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  async function refreshLogs() {
    if (!clientRecord) return;
    setLogs(await getProgressLogsForClient(clientRecord.id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !clientRecord) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createProgressLog({
        trainerId: clientRecord.trainer_id,
        clientId: clientRecord.id,
        logDate: String(formData.get("log_date") ?? ""),
        weight: String(formData.get("weight") ?? ""),
        bodyFat: String(formData.get("body_fat") ?? ""),
        chest: String(formData.get("chest") ?? ""),
        waist: String(formData.get("waist") ?? ""),
        hip: String(formData.get("hip") ?? ""),
      });
      await refreshLogs();
      event.currentTarget.reset();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save progress log.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || pageLoading) return <State text="Loading progress..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="CLIENT TOOLS"
      title={profile?.name ?? "CLIENT"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/client/dashboard", label: "Dashboard", icon: LineChartIcon },
        { to: "/client/workouts", label: "Workouts", icon: LineChartIcon },
        { to: "/client/diets", label: "Diet", icon: LineChartIcon },
        { to: "/client/progress", label: "Progress", icon: LineChartIcon },
        { to: "/client/files", label: "Files", icon: LineChartIcon },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add progress log</CardTitle>
            <CardDescription>Record your body metrics and keep your chart updated.</CardDescription>
          </CardHeader>
          <CardContent>
            {!clientRecord ? (
              <State text="Your account is signed in, but no linked client record exists yet." />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {(["log_date", "weight", "body_fat", "chest", "waist", "hip"] as const).map(
                  (field) => (
                    <div key={field} className="space-y-2">
                      <Label>{field.replace("_", " ").toUpperCase()}</Label>
                      <Input
                        name={field}
                        type={field === "log_date" ? "date" : "number"}
                        step="0.1"
                      />
                    </div>
                  ),
                )}
                <Button type="submit" disabled={saving}>
                  Save progress log
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress chart</CardTitle>
            <CardDescription>Your logged progress over time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.length ? (
              <div className="h-72 w-full rounded-md border border-border bg-background/60 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={logs.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="log_date" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-silver)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="waist"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <State text="No progress logs yet." />
            )}

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground"
                >
                  <div className="font-medium text-foreground">{log.log_date}</div>
                  <div className="mt-1">
                    Weight {log.weight ?? "-"} | Body fat {log.body_fat ?? "-"} | Chest{" "}
                    {log.chest ?? "-"} | Waist {log.waist ?? "-"} | Hip {log.hip ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function State({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
