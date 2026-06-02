import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Salad } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  getClientRecordForProfile,
  getDietPlansForClient,
  type ClientRecord,
  type DietPlanRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/client/diets")({
  component: ClientDietsPage,
});

function ClientDietsPage() {
  const { loading, profile, email } = useDashboardAccess("client");
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [plans, setPlans] = useState<DietPlanRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
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
        const data = await getDietPlansForClient(record.id);
        if (!active) return;
        setPlans(data);
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

  if (loading || pageLoading) return <State text="Loading diets..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="CLIENT TOOLS"
      title={profile?.name ?? "CLIENT"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/client/dashboard", label: "Dashboard", icon: Salad },
        { to: "/client/workouts", label: "Workouts", icon: Salad },
        { to: "/client/diets", label: "Diet", icon: Salad },
        { to: "/client/progress", label: "Progress", icon: Salad },
        { to: "/client/files", label: "Files", icon: Salad },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>My diet plans</CardTitle>
          <CardDescription>
            Only plans assigned to your linked client record are shown here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!clientRecord ? (
            <State text="Your account is signed in, but no linked client record exists yet." />
          ) : plans.length ? (
            plans.map((plan) => (
              <div key={plan.id} className="rounded-md border border-border bg-background/60 p-4">
                <div className="font-medium text-foreground">{plan.title}</div>
                <div className="text-sm text-muted-foreground">{plan.schedule}</div>
                <div className="mt-3 space-y-2">
                  {plan.meals.map((meal, index) => (
                    <div
                      key={`${plan.id}-${index}`}
                      className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground"
                    >
                      {meal.meal || "Meal"} | {meal.calories || "-"} cal | P {meal.protein || "-"} |
                      C {meal.carbs || "-"} | F {meal.fats || "-"}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <State text="No diet plan assigned yet." />
          )}
        </CardContent>
      </Card>
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
