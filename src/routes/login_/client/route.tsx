import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { getCurrentAuthRoute } from "@/lib/supabase/profiles";

export const Route = createFileRoute("/login_/client")({
  component: ClientLoginPage,
});

function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await getCurrentAuthRoute();

        if (cancelled) return;

        if (result.kind === "ready") {
          if (result.profile.role !== "client") {
            await supabase.auth.signOut();
            setError("This account is not registered as a client.");
            return;
          }
          navigate({ to: "/client/dashboard", replace: true });
          return;
        }

        if (result.kind === "missing_profile") {
          setMessage("Your account is signed in but has no profile. Contact your coach.");
        }
      } catch {
        if (!cancelled) {
          setError("We could not check your session right now. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function routeSignedInUser() {
    const result = await getCurrentAuthRoute();

    if (result.kind === "ready") {
      if (result.profile.role !== "client") {
        await supabase.auth.signOut();
        setError("This account is not registered as a client.");
        return false;
      }
      navigate({ to: "/client/dashboard", replace: true });
      return true;
    }

    if (result.kind === "missing_profile") {
      setMessage("Your account is signed in but has no profile. Contact your coach.");
      return true;
    }

    return false;
  }

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    const handled = await routeSignedInUser();
    if (!handled) {
      setError("Login successful but could not find your profile.");
    }
  }

  async function handleMagicLink() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Magic link sent. Check your email to continue.");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login options
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] text-silver-muted">CLIENT ACCESS</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-silver-gradient leading-[0.95]">
              CLIENT LOGIN
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-muted-foreground">
              Access your personalized coaching portal to track progress and stay connected with your coach.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <LogIn className="h-4 w-4 text-silver" />
                Progress tracking
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <Mail className="h-4 w-4 text-silver" />
                Check-ins and updates
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <Sparkles className="h-4 w-4 text-silver" />
                Private client access
              </div>
            </div>
          </div>

          <Card className="border-silver/20 bg-card/80">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Sign in to your client account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {booting ? (
                <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  Checking your session...
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
              </div>

              {error ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  {message}
                </p>
              ) : null}

              <div className="grid gap-3">
                <Button type="button" onClick={handleSignIn} disabled={loading}>
                  Sign In
                </Button>
                <Button type="button" variant="outline" onClick={handleMagicLink} disabled={loading}>
                  Send Magic Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
