import { supabase } from "./client";

export type ProfileRole = "trainer" | "client";

export type ProfileRecord = {
  id: string;
  role: ProfileRole;
  name: string;
  email: string;
  created_at: string;
};

const PROFILE_COLUMNS = "id, role, name, email, created_at";

export function getDashboardPath(role: ProfileRole) {
  return role === "trainer" ? "/trainer/dashboard" : "/client/dashboard";
}

export async function getCurrentSessionProfile() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return { session: null, profile: null as ProfileRecord | null };
  }

  const profile = await getProfileByUserId(session.user.id);

  return {
    session,
    profile,
  };
}

export async function getProfileByUserId(userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return profile as ProfileRecord | null;
}

export async function getCurrentAuthRoute() {
  const { session, profile } = await getCurrentSessionProfile();

  if (!session) {
    return { kind: "anonymous" as const, session: null, profile: null };
  }

  if (!profile) {
    return { kind: "missing_profile" as const, session, profile: null };
  }

  return { kind: "ready" as const, session, profile };
}
