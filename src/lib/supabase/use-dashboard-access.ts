import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  getCurrentSessionProfile,
  getDashboardPath,
  getProfileByUserId,
  type ProfileRecord,
  type ProfileRole,
} from "./profiles";
import { supabase } from "./client";

type AccessState = {
  loading: boolean;
  profile: ProfileRecord | null;
  email: string | undefined;
};

export function useDashboardAccess(expectedRole: ProfileRole) {
  const navigate = useNavigate();
  const [state, setState] = useState<AccessState>({
    loading: true,
    profile: null,
    email: undefined,
  });

  useEffect(() => {
    let active = true;

    async function evaluateAccess() {
      try {
        const { session, profile } = await getCurrentSessionProfile();

        if (!active) return;

        if (!session) {
          navigate({ to: "/login", replace: true });
          return;
        }

        if (!profile) {
          navigate({ to: "/login", replace: true });
          return;
        }

        if (profile.role !== expectedRole) {
          navigate({ to: getDashboardPath(profile.role), replace: true });
          return;
        }

        setState({
          loading: false,
          profile,
          email: session.user.email,
        });
      } catch {
        if (!active) return;
        navigate({ to: "/login", replace: true });
      }
    }

    void evaluateAccess();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      if (!nextSession) {
        navigate({ to: "/login", replace: true });
        return;
      }

      void (async () => {
        try {
          const profile = await getProfileByUserId(nextSession.user.id);

          if (!active) return;

          if (!profile) {
            navigate({ to: "/login", replace: true });
            return;
          }

          if (profile.role !== expectedRole) {
            navigate({ to: getDashboardPath(profile.role), replace: true });
            return;
          }

          setState({
            loading: false,
            profile,
            email: nextSession.user.email,
          });
        } catch {
          if (!active) return;
          navigate({ to: "/login", replace: true });
        }
      })();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [expectedRole, navigate]);

  return state;
}
