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
      <Card>
        <CardHeader>
          <CardTitle>My files</CardTitle>
          <CardDescription>Files shared by your trainer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!clientRecord ? (
            <State text="Your account is signed in, but no linked client record exists yet." />
          ) : files.length ? (
            files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-background/60 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium text-foreground">{file.file_name}</div>
                  <div className="text-sm text-muted-foreground">{file.mime_type ?? "File"}</div>
                </div>
                <SignedOpenButton file={file} />
              </div>
            ))
          ) : (
            <State text="No files shared yet." />
          )}
        </CardContent>
      </Card>
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
      className="inline-flex items-center rounded-md border border-silver/40 px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors"
    >
      Open
    </a>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={loadLink} disabled={loading}>
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
