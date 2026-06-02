import { supabase } from "./client";
import { getProfileByUserId, getCurrentSessionProfile, type ProfileRecord } from "./profiles";

export type ClientBodyStats = {
  weight: string;
  body_fat: string;
  chest: string;
  waist: string;
  hip: string;
};

export type ClientRecord = {
  id: string;
  trainer_id: string;
  user_id: string | null;
  name: string;
  email: string;
  goals: string | null;
  body_stats: ClientBodyStats | null;
  status: string;
  created_at: string;
};

export type WorkoutExercise = {
  day: string;
  name: string;
  sets: string;
  reps: string;
  rest_time: string;
};

export type WorkoutPlanRecord = {
  id: string;
  trainer_id: string;
  client_id: string;
  title: string;
  schedule: string;
  exercises: WorkoutExercise[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  client?: Pick<ClientRecord, "id" | "name" | "email"> | null;
};

export type MealItem = {
  meal: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export type DietPlanRecord = {
  id: string;
  trainer_id: string;
  client_id: string;
  title: string;
  schedule: string;
  meals: MealItem[];
  notes: string | null;
  is_active: boolean;
  created_at: string;
  client?: Pick<ClientRecord, "id" | "name" | "email"> | null;
};

export type ProgressLogRecord = {
  id: string;
  trainer_id: string;
  client_id: string;
  log_date: string;
  weight: string | null;
  body_fat: string | null;
  chest: string | null;
  waist: string | null;
  hip: string | null;
  created_at: string;
  client?: Pick<ClientRecord, "id" | "name" | "email"> | null;
};

export type FileRecord = {
  id: string;
  trainer_id: string;
  client_id: string;
  bucket_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  client?: Pick<ClientRecord, "id" | "name" | "email"> | null;
};

export type TrainerSummary = {
  totalClients: number;
  activeWorkoutPlans: number;
  activeDietPlans: number;
  recentProgressLogs: number;
};

export type ClientSummary = {
  workoutPlans: number;
  dietPlans: number;
  latestProgress: ProgressLogRecord | null;
  files: number;
};

function cleanJsonArray<T>(items: T[]) {
  return items.filter((item) =>
    Object.values(item as Record<string, unknown>).some((value) => value !== "" && value != null),
  );
}

export async function getTrainerContext() {
  const { session, profile } = await getCurrentSessionProfile();

  if (!session || !profile) {
    return { session: null, profile: null as ProfileRecord | null };
  }

  return { session, profile };
}

export async function getClientRecordForProfile(profile: ProfileRecord) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, trainer_id, user_id, name, email, goals, body_stats, status, created_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ClientRecord | null;
}

export async function getTrainerClients(trainerId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, trainer_id, user_id, name, email, goals, body_stats, status, created_at")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ClientRecord[];
}

export async function upsertTrainerClient(params: {
  trainerId: string;
  clientId?: string;
  name: string;
  email: string;
  goals: string;
  bodyStats: ClientBodyStats;
  status: string;
}) {
  const { data: linkedProfile } = await supabase
    .from("profiles")
    .select("id, role, name, email, created_at")
    .eq("email", params.email)
    .eq("role", "client")
    .maybeSingle();

  const payload = {
    trainer_id: params.trainerId,
    user_id: linkedProfile?.id ?? null,
    name: params.name,
    email: params.email,
    goals: params.goals,
    body_stats: params.bodyStats,
    status: params.status,
  };

  if (params.clientId) {
    const { data, error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", params.clientId)
      .eq("trainer_id", params.trainerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ClientRecord;
  }

  const { data, error } = await supabase.from("clients").insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data as ClientRecord;
}

export async function deleteTrainerClient(trainerId: string, clientId: string) {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("trainer_id", trainerId);

  if (error) {
    throw error;
  }
}

export async function getWorkoutPlansForTrainer(trainerId: string) {
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      "id, trainer_id, client_id, title, schedule, exercises, notes, is_active, created_at, client:clients(id, name, email)",
    )
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as WorkoutPlanRecord[];
}

export async function getWorkoutPlansForClient(clientId: string) {
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      "id, trainer_id, client_id, title, schedule, exercises, notes, is_active, created_at, client:clients(id, name, email)",
    )
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as WorkoutPlanRecord[];
}

export async function upsertWorkoutPlan(params: {
  trainerId: string;
  clientId: string;
  title: string;
  schedule: string;
  exercises: WorkoutExercise[];
  notes: string;
  isActive: boolean;
  workoutId?: string;
}) {
  const payload = {
    trainer_id: params.trainerId,
    client_id: params.clientId,
    title: params.title,
    schedule: params.schedule,
    exercises: cleanJsonArray(params.exercises),
    notes: params.notes,
    is_active: params.isActive,
  };

  if (params.workoutId) {
    const { data, error } = await supabase
      .from("workout_plans")
      .update(payload)
      .eq("id", params.workoutId)
      .eq("trainer_id", params.trainerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as WorkoutPlanRecord;
  }

  const { data, error } = await supabase.from("workout_plans").insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data as WorkoutPlanRecord;
}

export async function deleteWorkoutPlan(trainerId: string, workoutId: string) {
  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", workoutId)
    .eq("trainer_id", trainerId);

  if (error) {
    throw error;
  }
}

export async function getDietPlansForTrainer(trainerId: string) {
  const { data, error } = await supabase
    .from("diet_plans")
    .select(
      "id, trainer_id, client_id, title, schedule, meals, notes, is_active, created_at, client:clients(id, name, email)",
    )
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DietPlanRecord[];
}

export async function getDietPlansForClient(clientId: string) {
  const { data, error } = await supabase
    .from("diet_plans")
    .select(
      "id, trainer_id, client_id, title, schedule, meals, notes, is_active, created_at, client:clients(id, name, email)",
    )
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DietPlanRecord[];
}

export async function upsertDietPlan(params: {
  trainerId: string;
  clientId: string;
  title: string;
  schedule: string;
  meals: MealItem[];
  notes: string;
  isActive: boolean;
  dietId?: string;
}) {
  const payload = {
    trainer_id: params.trainerId,
    client_id: params.clientId,
    title: params.title,
    schedule: params.schedule,
    meals: cleanJsonArray(params.meals),
    notes: params.notes,
    is_active: params.isActive,
  };

  if (params.dietId) {
    const { data, error } = await supabase
      .from("diet_plans")
      .update(payload)
      .eq("id", params.dietId)
      .eq("trainer_id", params.trainerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as DietPlanRecord;
  }

  const { data, error } = await supabase.from("diet_plans").insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data as DietPlanRecord;
}

export async function deleteDietPlan(trainerId: string, dietId: string) {
  const { error } = await supabase
    .from("diet_plans")
    .delete()
    .eq("id", dietId)
    .eq("trainer_id", trainerId);

  if (error) {
    throw error;
  }
}

export async function getProgressLogsForTrainer(trainerId: string, clientId?: string) {
  let query = supabase
    .from("progress_logs")
    .select(
      "id, trainer_id, client_id, log_date, weight, body_fat, chest, waist, hip, created_at, client:clients(id, name, email)",
    )
    .eq("trainer_id", trainerId)
    .order("log_date", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ProgressLogRecord[];
}

export async function getProgressLogsForClient(clientId: string) {
  const { data, error } = await supabase
    .from("progress_logs")
    .select(
      "id, trainer_id, client_id, log_date, weight, body_fat, chest, waist, hip, created_at, client:clients(id, name, email)",
    )
    .eq("client_id", clientId)
    .order("log_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProgressLogRecord[];
}

export async function createProgressLog(params: {
  trainerId: string;
  clientId: string;
  logDate: string;
  weight: string;
  bodyFat: string;
  chest: string;
  waist: string;
  hip: string;
}) {
  const payload = {
    trainer_id: params.trainerId,
    client_id: params.clientId,
    log_date: params.logDate,
    weight: params.weight || null,
    body_fat: params.bodyFat || null,
    chest: params.chest || null,
    waist: params.waist || null,
    hip: params.hip || null,
  };

  const { data, error } = await supabase.from("progress_logs").insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data as ProgressLogRecord;
}

export async function getFilesForTrainer(trainerId: string) {
  const { data, error } = await supabase
    .from("files")
    .select(
      "id, trainer_id, client_id, bucket_id, file_path, file_name, mime_type, file_size, created_at, client:clients(id, name, email)",
    )
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as FileRecord[];
}

export async function getFilesForClient(clientId: string) {
  const { data, error } = await supabase
    .from("files")
    .select(
      "id, trainer_id, client_id, bucket_id, file_path, file_name, mime_type, file_size, created_at, client:clients(id, name, email)",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as FileRecord[];
}

export async function uploadTrainerFile(params: {
  trainerId: string;
  clientId: string;
  file: File;
}) {
  const bucketId = "client-files";
  const sanitizedName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${params.trainerId}/${params.clientId}/${crypto.randomUUID()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketId)
    .upload(filePath, params.file, {
      upsert: false,
      contentType: params.file.type || "application/octet-stream",
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("files")
    .insert({
      trainer_id: params.trainerId,
      client_id: params.clientId,
      bucket_id: bucketId,
      file_path: filePath,
      file_name: params.file.name,
      mime_type: params.file.type || null,
      file_size: params.file.size,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as FileRecord;
}

export async function deleteTrainerFile(trainerId: string, fileId: string) {
  const { data, error } = await supabase
    .from("files")
    .select("bucket_id, file_path")
    .eq("id", fileId)
    .eq("trainer_id", trainerId)
    .single();

  if (error) {
    throw error;
  }

  const { error: storageError } = await supabase.storage
    .from(data.bucket_id)
    .remove([data.file_path]);

  if (storageError) {
    throw storageError;
  }

  const { error: deleteError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId)
    .eq("trainer_id", trainerId);

  if (deleteError) {
    throw deleteError;
  }
}

export async function getSignedFileUrl(bucketId: string, filePath: string) {
  const { data, error } = await supabase.storage.from(bucketId).createSignedUrl(filePath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function getTrainerSummary(trainerId: string): Promise<TrainerSummary> {
  const [clients, workouts, diets, progress] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", trainerId),
    supabase
      .from("workout_plans")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("is_active", true),
    supabase
      .from("diet_plans")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", trainerId)
      .eq("is_active", true),
    supabase
      .from("progress_logs")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", trainerId),
  ]);

  return {
    totalClients: clients.count ?? 0,
    activeWorkoutPlans: workouts.count ?? 0,
    activeDietPlans: diets.count ?? 0,
    recentProgressLogs: progress.count ?? 0,
  };
}

export async function getClientSummary(clientId: string): Promise<ClientSummary> {
  const [workouts, diets, progress, files] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("is_active", true),
    supabase
      .from("diet_plans")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("is_active", true),
    supabase
      .from("progress_logs")
      .select(
        "id, trainer_id, client_id, log_date, weight, body_fat, chest, waist, hip, created_at",
      )
      .eq("client_id", clientId)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase.from("files").select("id", { count: "exact", head: true }).eq("client_id", clientId),
  ]);

  return {
    workoutPlans: workouts.count ?? 0,
    dietPlans: diets.count ?? 0,
    latestProgress: (progress.data?.[0] as ProgressLogRecord | undefined) ?? null,
    files: files.count ?? 0,
  };
}
