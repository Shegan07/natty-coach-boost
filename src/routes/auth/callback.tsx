import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { getCurrentAuthRoute, getDashboardPath } from "@/lib/supabase/profiles";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Completing sign-in...");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) {
        setError("No auth code was found in the callback URL.");
        setDone(true);
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (exchangeError) {
        setError(exchangeError.message);
        setDone(true);
        return;
      }

      const result = await getCurrentAuthRoute();

      if (cancelled) return;

      if (result.kind === "ready") {
        setStatus("Sign-in complete. Redirecting...");
        setDone(true);
        navigate({ to: getDashboardPath(result.profile.role), replace: true });
        return;
      }

      setError(
        "Your account is signed in, but no profile exists yet. Please ask the coach to finish setup.",
      );
      setDone(true);
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-silver/20 bg-card/80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-silver/30 bg-secondary">
            {done ? (
              <ShieldCheck className="h-6 w-6 text-silver" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-silver" />
            )}
          </div>
          <CardTitle>Auth callback</CardTitle>
          <CardDescription>{error ?? status}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/login", replace: true })}
          >
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
