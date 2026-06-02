import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Plus, Trash2, Users } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  deleteTrainerClient,
  getTrainerClients,
  upsertTrainerClient,
  type ClientBodyStats,
  type ClientRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/trainer/clients")({
  component: TrainerClientsPage,
});

const blankBodyStats: ClientBodyStats = {
  weight: "",
  body_fat: "",
  chest: "",
  waist: "",
  hip: "",
};

function TrainerClientsPage() {
  const { loading, profile, email } = useDashboardAccess("trainer");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    goals: "",
    status: "active",
    bodyStats: blankBodyStats,
  });

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === editingId) ?? null,
    [clients, editingId],
  );

  useEffect(() => {
    if (!profile) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const data = await getTrainerClients(profile.id);
        if (!active) return;
        setClients(data);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load clients.");
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

  function startEdit(client: ClientRecord) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      goals: client.goals ?? "",
      status: client.status ?? "active",
      bodyStats: client.body_stats ?? blankBodyStats,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      goals: "",
      status: "active",
      bodyStats: blankBodyStats,
    });
  }

  async function refreshClients() {
    if (!profile) return;
    const data = await getTrainerClients(profile.id);
    setClients(data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      await upsertTrainerClient({
        trainerId: profile.id,
        clientId: editingId ?? undefined,
        name: form.name,
        email: form.email,
        goals: form.goals,
        bodyStats: form.bodyStats,
        status: form.status,
      });
      await refreshClients();
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save client.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(clientId: string) {
    if (!profile) return;
    if (!window.confirm("Delete this client and all assigned records?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteTrainerClient(profile.id, clientId);
      await refreshClients();
      if (editingId === clientId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete client.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || pageLoading) {
    return <LoadingState text="Loading clients..." />;
  }

  if (error) {
    return <LoadingState text={error} />;
  }

  return (
    <DashboardLayout
      roleLabel="TRAINER TOOLS"
      title={profile?.name ?? "TRAINER"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/trainer/dashboard", label: "Dashboard", icon: Users },
        { to: "/trainer/clients", label: "Clients", icon: Users },
        { to: "/trainer/workouts", label: "Workouts", icon: Users },
        { to: "/trainer/diets", label: "Diets", icon: Users },
        { to: "/trainer/progress", label: "Progress", icon: Users },
        { to: "/trainer/files", label: "Files", icon: Users },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Own clients</CardTitle>
            <CardDescription>
              View, update, and remove the clients linked to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.length ? (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-md border border-border bg-background/60 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.email}</div>
                      <div className="text-xs uppercase tracking-widest text-silver-muted">
                        {client.status}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {client.goals || "No goals yet."}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(client)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
                    <StatChip label="Weight" value={client.body_stats?.weight ?? "-"} />
                    <StatChip label="Body Fat" value={client.body_stats?.body_fat ?? "-"} />
                    <StatChip label="Chest" value={client.body_stats?.chest ?? "-"} />
                    <StatChip label="Waist" value={client.body_stats?.waist ?? "-"} />
                    <StatChip label="Hip" value={client.body_stats?.hip ?? "-"} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No clients have been added yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedClient ? "Edit client" : "Add client"}</CardTitle>
            <CardDescription>Store client details and body stats.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Client name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="client@example.com"
                />
              </Field>
              <Field label="Goals">
                <Textarea
                  value={form.goals}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, goals: event.target.value }))
                  }
                  placeholder="Fat loss, muscle gain, strength..."
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="lead">Lead</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["weight", "body_fat", "chest", "waist", "hip"] as const).map((key) => (
                  <Field key={key} label={key.replace("_", " ").toUpperCase()}>
                    <Input
                      value={form.bodyStats[key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bodyStats: { ...current.bodyStats, [key]: event.target.value },
                        }))
                      }
                      placeholder="0"
                    />
                  </Field>
                ))}
              </div>

              {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  <Plus className="h-4 w-4" />
                  {selectedClient ? "Update client" : "Add client"}
                </Button>
                {selectedClient ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/60 px-3 py-2">
      <div className="uppercase tracking-widest text-silver-muted">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}

function InlineMessage({ tone, children }: { tone: "error"; children: ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
