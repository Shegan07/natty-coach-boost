import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileUp, FileText, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardAccess } from "@/lib/supabase/use-dashboard-access";
import {
  deleteTrainerFile,
  getFilesForTrainer,
  getSignedFileUrl,
  getTrainerClients,
  uploadTrainerFile,
  type ClientRecord,
  type FileRecord,
} from "@/lib/supabase/trainer-system";

export const Route = createFileRoute("/trainer/files")({
  component: TrainerFilesPage,
});

function TrainerFilesPage() {
  const { loading, profile, email } = useDashboardAccess("trainer");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!profile) return;

    let active = true;
    void (async () => {
      try {
        const [clientData, fileData] = await Promise.all([
          getTrainerClients(profile.id),
          getFilesForTrainer(profile.id),
        ]);
        if (!active) return;
        setClients(clientData);
        setFiles(fileData);
        setSelectedClientId(clientData[0]?.id ?? "");
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

  async function refreshFiles() {
    if (!profile) return;
    setFiles(await getFilesForTrainer(profile.id));
  }

  async function handleUpload() {
    if (!profile || !selectedClientId || !selectedFile) return;

    setSaving(true);
    setError(null);

    try {
      await uploadTrainerFile({
        trainerId: profile.id,
        clientId: selectedClientId,
        file: selectedFile,
      });
      await refreshFiles();
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload file.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fileId: string) {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await deleteTrainerFile(profile.id, fileId);
      await refreshFiles();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete file.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || pageLoading) return <State text="Loading files..." />;
  if (error) return <State text={error} />;

  return (
    <DashboardLayout
      roleLabel="TRAINER TOOLS"
      title={profile?.name ?? "TRAINER"}
      subtitle={email ?? profile?.email}
      links={[
        { to: "/trainer/dashboard", label: "Dashboard", icon: FileText },
        { to: "/trainer/clients", label: "Clients", icon: FileText },
        { to: "/trainer/workouts", label: "Workouts", icon: FileText },
        { to: "/trainer/diets", label: "Diets", icon: FileText },
        { to: "/trainer/progress", label: "Progress", icon: FileText },
        { to: "/trainer/files", label: "Files", icon: FileText },
      ]}
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Upload file</CardTitle>
            <CardDescription className="text-xs sm:text-sm">PDFs and images for clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Client</Label>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">File</Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="h-8 text-xs"
              />
            </div>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={saving || !selectedClientId || !selectedFile}
              className="w-full text-xs sm:text-sm"
            >
              <FileUp className="h-3 w-3 sm:h-4 sm:w-4" />
              Upload
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Shared files</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Uploaded for your clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {files.length ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-2 sm:gap-3 rounded-md border border-border/50 bg-background/40 p-3 sm:p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base">{file.file_name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {file.client?.name ?? "Unknown client"} | {file.mime_type ?? "File"}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <SignedOpenButton file={file} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <State text="No files uploaded yet." />
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
