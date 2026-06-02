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
      <div className="flex flex-col gap-4 sm:gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">My diet plans</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Plans assigned to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {!clientRecord ? (
              <State text="Your account is signed in, but no linked client record exists yet." />
            ) : plans.length ? (
              plans.map((plan) => (
                <div key={plan.id} className="rounded-md border border-border/50 bg-background/40 p-3 sm:p-4">
                  <div className="font-medium text-foreground text-sm sm:text-base">{plan.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{plan.schedule}</div>
                  <div className="mt-2 sm:mt-3 space-y-1">
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
              <State text="No diet plan assigned yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function State({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-3 sm:px-4 py-4 sm:py-6 text-xs sm:text-sm text-muted-foreground">
      {text}
    </div>
  );
}
