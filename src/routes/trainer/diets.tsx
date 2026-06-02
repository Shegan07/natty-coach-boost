import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Plus, Trash2, Salad } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  deleteDietPlan,
  getDietPlansForTrainer,
  getTrainerClients,
  upsertDietPlan,
  type ClientRecord,
  type DietPlanRecord,
  type MealItem,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/trainer/diets")({
  component: TrainerDietsPage,
});

const emptyMeal = (): MealItem => ({
  meal: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
});

function TrainerDietsPage() {
  const { loading, profile, email } = useDashboardAccess("trainer");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [plans, setPlans] = useState<DietPlanRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientId: "",
    title: "",
    schedule: "",
    notes: "",
    isActive: true,
    meals: [emptyMeal()],
  });

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === editingId) ?? null,
    [editingId, plans],
  );

  useEffect(() => {
    if (!profile) return;

    let active = true;
    void (async () => {
      try {
        const [clientData, planData] = await Promise.all([
          getTrainerClients(profile.id),
          getDietPlansForTrainer(profile.id),
        ]);
        if (!active) return;
        setClients(clientData);
        setPlans(planData);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load diets.");
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  useEffect(() => {
    if (!form.clientId && clients[0]?.id) {
      setForm((current) => ({ ...current, clientId: clients[0].id }));
    }
  }, [clients, form.clientId]);

  function resetForm() {
    setEditingId(null);
    setForm({
      clientId: clients[0]?.id ?? "",
      title: "",
      schedule: "",
      notes: "",
      isActive: true,
      meals: [emptyMeal()],
    });
  }

  function startEdit(plan: DietPlanRecord) {
    setEditingId(plan.id);
    setForm({
      clientId: plan.client_id,
      title: plan.title,
      schedule: plan.schedule,
      notes: plan.notes ?? "",
      isActive: plan.is_active,
      meals: plan.meals.length ? plan.meals : [emptyMeal()],
    });
  }

  async function refreshPlans() {
    if (!profile) return;
    setPlans(await getDietPlansForTrainer(profile.id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      await upsertDietPlan({
        trainerId: profile.id,
        clientId: form.clientId,
        title: form.title,
        schedule: form.schedule,
        notes: form.notes,
        isActive: form.isActive,
        meals: form.meals,
        dietId: editingId ?? undefined,
      });
      await refreshPlans();
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save diet plan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(planId: string) {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await deleteDietPlan(profile.id, planId);
      await refreshPlans();
      if (editingId === planId) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete diet plan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || pageLoading) return <State text="Loading diets..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="TRAINER TOOLS"
      title={profile?.name ?? "TRAINER"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/trainer/dashboard", label: "Dashboard", icon: Salad },
        { to: "/trainer/clients", label: "Clients", icon: Salad },
        { to: "/trainer/workouts", label: "Workouts", icon: Salad },
        { to: "/trainer/diets", label: "Diets", icon: Salad },
        { to: "/trainer/progress", label: "Progress", icon: Salad },
        { to: "/trainer/files", label: "Files", icon: Salad },
      ]}
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Diet plans</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Plans assigned to your clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {plans.length ? (
              plans.map((plan) => (
                <div key={plan.id} className="rounded-md border border-border/50 bg-background/40 p-3 sm:p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm sm:text-base">{plan.title}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {plan.client?.name ?? "Unknown client"} - {plan.schedule}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(plan)}
                        className="h-8 px-2 text-xs"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="h-8 px-2 text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {plan.meals.map((meal, index) => (
                      <div
                        key={`${plan.id}-${index}`}
                        className="rounded-sm border border-border/50 bg-background/60 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground"
                      >
                        {meal.meal || "Meal"} | {meal.calories || "-"} cal | P {meal.protein || "-"} | C {meal.carbs || "-"} | F {meal.fats || "-"}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <State text="No diet plans created yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">{selectedPlan ? "Edit plan" : "New plan"}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Add meals and macros</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Field label="Client">
                <select
                  value={form.clientId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, clientId: event.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>
              <Field label="Schedule">
                <Input
                  value={form.schedule}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, schedule: event.target.value }))
                  }
                />
              </Field>
              <Field label="Notes">
                <Textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </Field>
              <Field label="Active">
                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.value === "true" }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Meals</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm((current) => ({ ...current, meals: [...current.meals, emptyMeal()] }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add row
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-md border border-border bg-background/60 p-3 sm:grid-cols-2"
                    >
                      {(["meal", "calories", "protein", "carbs", "fats"] as const).map((field) => (
                        <Field key={field} label={field.toUpperCase()}>
                          <Input
                            value={meal[field]}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                meals: current.meals.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, [field]: event.target.value }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </Field>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {error ? <Message>{error}</Message> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  Save diet plan
                </Button>
                {selectedPlan ? (
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

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
      {children}
    </div>
  );
}

function State({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
