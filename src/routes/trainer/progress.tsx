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
  getProgressLogsForTrainer,
  getTrainerClients,
  type ClientRecord,
  type ProgressLogRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/trainer/progress")({
  component: TrainerProgressPage,
});

function TrainerProgressPage() {
  const { loading, profile, email } = useDashboardAccess("trainer");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [logs, setLogs] = useState<ProgressLogRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    let active = true;
    void (async () => {
      try {
        const [clientData, logData] = await Promise.all([
          getTrainerClients(profile.id),
          getProgressLogsForTrainer(profile.id),
        ]);
        if (!active) return;
        setClients(clientData);
        setLogs(logData);
        setSelectedClientId(clientData[0]?.id ?? "");
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

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;
  const selectedLogs = logs.filter((log) => log.client_id === selectedClientId);

  async function refreshLogs() {
    if (!profile) return;
    setLogs(await getProgressLogsForTrainer(profile.id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !selectedClientId) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createProgressLog({
        trainerId: profile.id,
        clientId: selectedClientId,
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
      roleLabel="TRAINER TOOLS"
      title={profile?.name ?? "TRAINER"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/trainer/dashboard", label: "Dashboard", icon: LineChartIcon },
        { to: "/trainer/clients", label: "Clients", icon: LineChartIcon },
        { to: "/trainer/workouts", label: "Workouts", icon: LineChartIcon },
        { to: "/trainer/diets", label: "Diets", icon: LineChartIcon },
        { to: "/trainer/progress", label: "Progress", icon: LineChartIcon },
        { to: "/trainer/files", label: "Files", icon: LineChartIcon },
      ]}
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Client</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Select to view logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Client</Label>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedClient ? (
              <div className="rounded-md border border-border/50 bg-background/40 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground">
                <div className="font-medium text-foreground text-sm sm:text-base">{selectedClient.name}</div>
                <div className="text-xs">{selectedClient.email}</div>
                <div className="mt-1 text-xs">{selectedClient.goals ?? "No goals yet."}</div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              {(["log_date", "weight", "body_fat", "chest", "waist", "hip"] as const).map(
                (field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs sm:text-sm">{field.replace("_", " ").toUpperCase()}</Label>
                    <Input
                      name={field}
                      type={field === "log_date" ? "date" : "number"}
                      step="0.1"
                      className="h-8 text-xs sm:text-sm"
                    />
                  </div>
                ),
              )}
              <Button type="submit" disabled={saving || !selectedClientId} className="w-full text-xs sm:text-sm">
                Save log
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Progress chart</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {selectedLogs.length ? (
              <div className="h-64 sm:h-72 w-full rounded-md border border-border/50 bg-background/40 p-2 sm:p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedLogs.slice().reverse()}>
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

            <div className="space-y-2 sm:space-y-3">
              {selectedLogs.length
                ? selectedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-md border border-border/50 bg-background/40 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground"
                    >
                      <div className="font-medium text-foreground text-sm sm:text-base">{log.log_date}</div>
                      <div className="mt-1 text-xs sm:text-sm">
                        Weight {log.weight ?? "-"} | Body fat {log.body_fat ?? "-"} | Chest {log.chest ?? "-"} | Waist {log.waist ?? "-"} | Hip {log.hip ?? "-"}
                      </div>
                    </div>
                  ))
                : null}
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
