import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Plus, Copy, Check, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const appSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PUBLIC", "CONFIDENTIAL"]),
  redirect_uris_input: z
    .string()
    .min(1, "At least one redirect URI is required")
    .refine(
      (value) => {
        const redirectUris = value
          .split("\n")
          .map((uri) => uri.trim())
          .filter((uri) => uri.length > 0);

        if (redirectUris.length === 0) return false;

        try {
          redirectUris.forEach((uri) => new URL(uri));
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "All redirect URIs must be valid URLs",
      }
    ),
  roles_input: z.string().optional().default(""),
});

type AppFormData = z.infer<typeof appSchema>;

export function CreateAppDialog() {
  const [open, setOpen] = useState(false);
  const [createdApp, setCreatedApp] = useState<{
    client_id: string;
    client_secret?: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<AppFormData>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      type: "PUBLIC",
      redirect_uris_input: "",
      roles_input: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AppFormData) => {
      const redirect_uris = data.redirect_uris_input
        .split("\n")
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);

      const roles =
        data.roles_input
          ?.split("\n")
          .map((role) => role.trim())
          .filter((role) => role.length > 0) ?? [];

      return apiClient.createApp({
        name: data.name,
        type: data.type,
        redirect_uris,
        roles: roles.length > 0 ? roles : undefined,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setCreatedApp({
        client_id: response.app.client_id,
        client_secret: response.app.client_secret,
      });
      addToast({
        title: "Application created",
        description: "The application has been created successfully.",
      });
      reset();
    },
    onError: (error: any) => {
      addToast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppFormData) => {
    createMutation.mutate(data);
  };

  const handleCopySecret = async () => {
    if (createdApp?.client_secret) {
      const success = await copyToClipboard(createdApp.client_secret);
      if (success) {
        setCopiedSecret(true);
        addToast({
          title: "Copied!",
          description: "Client secret copied to clipboard",
        });
        setTimeout(() => setCopiedSecret(false), 2000);
      }
    }
  };

  const handleClose = () => {
    setOpen(!open);
    setCreatedApp(null);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
          <DialogDescription>
            Create a new application to get client credentials
          </DialogDescription>
        </DialogHeader>

        {createdApp ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Save your credentials
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    The client secret will only be shown once. Make sure to save
                    it securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                  {createdApp.client_id}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdApp.client_id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {createdApp.client_secret && (
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {createdApp.client_secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopySecret}
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="My Application"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as "PUBLIC" | "CONFIDENTIAL")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                      <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="redirect_uris_input">
                Redirect URIs (one per line)
              </Label>
              <textarea
                id="redirect_uris_input"
                {...register("redirect_uris_input")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com/callback&#10;https://example.com/auth/callback"
                aria-invalid={!!errors.redirect_uris_input}
              />
              {errors.redirect_uris_input && (
                <p className="text-sm text-destructive">
                  {errors.redirect_uris_input.message}
                </p>
              )}
            </div>

        <div className="space-y-2">
          <Label htmlFor="roles_input">Roles (one per line, optional)</Label>
          <textarea
            id="roles_input"
            {...register("roles_input")}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={"admin\nviewer\neditor"}
          />
        </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
