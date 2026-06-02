import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  getClientRecordForProfile,
  getWorkoutPlansForClient,
  type ClientRecord,
  type WorkoutPlanRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/client/workouts")({
  component: ClientWorkoutsPage,
});

function ClientWorkoutsPage() {
  const { loading, profile, email } = useDashboardAccess("client");
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [plans, setPlans] = useState<WorkoutPlanRecord[]>([]);
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
        const data = await getWorkoutPlansForClient(record.id);
        if (!active) return;
        setPlans(data);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load workouts.");
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  if (loading || pageLoading) return <State text="Loading workouts..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="CLIENT TOOLS"
      title={profile?.name ?? "CLIENT"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/client/dashboard", label: "Dashboard", icon: Dumbbell },
        { to: "/client/workouts", label: "Workouts", icon: Dumbbell },
        { to: "/client/diets", label: "Diet", icon: Dumbbell },
        { to: "/client/progress", label: "Progress", icon: Dumbbell },
        { to: "/client/files", label: "Files", icon: Dumbbell },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>My workout plans</CardTitle>
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
                  {plan.exercises.map((exercise, index) => (
                    <div
                      key={`${plan.id}-${index}`}
                      className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground"
                    >
                      {exercise.day || "Day"} - {exercise.name || "Exercise"} |{" "}
                      {exercise.sets || "-"} x {exercise.reps || "-"} | Rest{" "}
                      {exercise.rest_time || "-"}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <State text="No workout plan assigned yet." />
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
