import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginSelection,
});

function LoginSelection() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-silver-gradient leading-[0.95] mb-4">
            NATTY COACH
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your login type to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coach Login */}
          <Link
            to="/login/coach"
            className="group relative rounded-lg border border-border bg-card/50 p-8 hover:bg-card/80 transition-all hover:border-silver/50"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-silver/10 p-4 group-hover:bg-silver/20 transition-colors">
                <LogIn className="h-8 w-8 text-silver" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Coach Login</h2>
                <p className="text-muted-foreground mb-6">
                  Access your coaching dashboard to manage clients and create programs.
                </p>
                <Button size="lg" className="w-full">
                  Sign In as Coach
                </Button>
              </div>
            </div>
          </Link>

          {/* Client Login */}
          <Link
            to="/login/client"
            className="group relative rounded-lg border border-border bg-card/50 p-8 hover:bg-card/80 transition-all hover:border-silver/50"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-silver/10 p-4 group-hover:bg-silver/20 transition-colors">
                <Users className="h-8 w-8 text-silver" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Client Login</h2>
                <p className="text-muted-foreground mb-6">
                  Access your personalized coaching portal and track your progress.
                </p>
                <Button size="lg" className="w-full">
                  Sign In as Client
                </Button>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
