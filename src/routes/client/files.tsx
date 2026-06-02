import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  getClientRecordForProfile,
  getFilesForClient,
  getSignedFileUrl,
  type ClientRecord,
  type FileRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/client/files")({
  component: ClientFilesPage,
});

function ClientFilesPage() {
  const { loading, profile, email } = useDashboardAccess("client");
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
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
        const data = await getFilesForClient(record.id);
        if (!active) return;
        setFiles(data);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load files.");
      } finally {
        if (active) setPageLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile]);

  if (loading || pageLoading) return <State text="Loading files..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="CLIENT TOOLS"
      title={profile?.name ?? "CLIENT"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/client/dashboard", label: "Dashboard", icon: FileText },
        { to: "/client/workouts", label: "Workouts", icon: FileText },
        { to: "/client/diets", label: "Diet", icon: FileText },
        { to: "/client/progress", label: "Progress", icon: FileText },
        { to: "/client/files", label: "Files", icon: FileText },
      ]}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">My files</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Shared by your trainer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {!clientRecord ? (
              <State text="Your account is signed in, but no linked client record exists yet." />
            ) : files.length ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-2 sm:gap-3 rounded-md border border-border/50 bg-background/40 p-3 sm:p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base">{file.file_name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{file.mime_type ?? "File"}</div>
                  </div>
                  <SignedOpenButton file={file} />
                </div>
              ))
            ) : (
              <State text="No files shared yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function SignedOpenButton({ file }: { file: FileRecord }) {
  const [href, setHref] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadLink() {
    setLoading(true);
    try {
      setHref(await getSignedFileUrl(file.bucket_id, file.file_path));
    } finally {
      setLoading(false);
    }
  }

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-md border border-silver/40 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-secondary transition-colors flex-shrink-0"
    >
      Open
    </a>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={loadLink} disabled={loading} className="h-8 px-2 text-xs flex-shrink-0">
      Open
    </Button>
  );
}

function State({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
