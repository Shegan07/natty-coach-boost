import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { getCurrentAuthRoute, getDashboardPath } from "@/lib/supabase/profiles";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getCurrentAuthRoute();

      if (cancelled) return;

      if (result.kind === "ready") {
        navigate({ to: getDashboardPath(result.profile.role), replace: true });
        return;
      }

      navigate({ to: "/login", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      Routing to your dashboard...
    </div>
  );
}
