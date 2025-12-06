import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {apiClient} from "@/lib/api";
import {App, EmailConfig, CreateEmailConfigRequest, UpdateEmailConfigRequest} from "@/types";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useToast} from "@/components/ui/toast";
import {Badge} from "@/components/ui/badge";
import {Loader2, Mail} from "lucide-react";
import {useForm, Controller} from "react-hook-form";
import {Checkbox} from "@/components/ui/checkbox";

function EmailConfigForm({
                              app,
                              config,
                              onClose,
                          }: {
    app: App;
    config?: EmailConfig;
    onClose: () => void;
}) {
    const {addToast} = useToast();
    const queryClient = useQueryClient();
    const isEditing = !!config;

    const {
        control,
        register,
        handleSubmit,
        formState: {isSubmitting},
    } = useForm<CreateEmailConfigRequest>({
        defaultValues: {
            smtpHost: config?.smtpHost ?? "",
            smtpPort: config?.smtpPort ?? 587,
            smtpSecure: config?.smtpSecure ?? false,
            smtpUser: config?.smtpUser ?? "",
            smtpPassword: "", // Don't populate password for security
            fromEmail: config?.fromEmail ?? "",
            fromName: config?.fromName ?? "Rugi Auth",
            enabled: config?.enabled ?? true,
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEmailConfigRequest) =>
            apiClient.createEmailConfig(app.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["email-config"]});
            addToast({
                title: "Success",
                description: "Email configuration created successfully",
            });
            onClose();
        },
        onError: (error: any) => {
            addToast({
                title: "Error",
                description:
                    error.response?.data?.error || "Failed to create email configuration",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateEmailConfigRequest) =>
            apiClient.updateEmailConfig(app.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["email-config"]});
            addToast({
                title: "Success",
                description: "Email configuration updated successfully",
            });
            onClose();
        },
        onError: (error: any) => {
            addToast({
                title: "Error",
                description:
                    error.response?.data?.error || "Failed to update email configuration",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: CreateEmailConfigRequest) => {
        if (isEditing) {
            // For updates, send all fields but only include password if provided
            const updateData: UpdateEmailConfigRequest = {
                smtpHost: data.smtpHost,
                smtpPort: data.smtpPort,
                smtpSecure: data.smtpSecure,
                smtpUser: data.smtpUser,
                fromEmail: data.fromEmail,
                fromName: data.fromName,
                enabled: data.enabled,
            };
            // Only include password if it's provided (not empty)
            if (data.smtpPassword && data.smtpPassword.trim() !== "") {
                updateData.smtpPassword = data.smtpPassword;
            }
            updateMutation.mutate(updateData);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">SMTP Configuration</h3>
                
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="smtpHost">SMTP Host *</Label>
                        <Input
                            id="smtpHost"
                            {...register("smtpHost", {required: "SMTP Host is required"})}
                            placeholder="smtp.gmail.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="smtpPort">SMTP Port *</Label>
                        <Input
                            id="smtpPort"
                            type="number"
                            {...register("smtpPort", {
                                required: "SMTP Port is required",
                                valueAsNumber: true,
                            })}
                            placeholder="587"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Use Secure Connection (TLS/SSL)</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable for port 465 (SSL) or 587 (TLS)
                            </p>
                        </div>
                        <Controller
                            control={control}
                            name="smtpSecure"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="smtpUser">SMTP Username *</Label>
                        <Input
                            id="smtpUser"
                            {...register("smtpUser", {required: "SMTP Username is required"})}
                            placeholder="your-email@gmail.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="smtpPassword">
                            SMTP Password {isEditing && "(leave blank to keep current)"} *
                        </Label>
                        <Input
                            id="smtpPassword"
                            type="password"
                            {...register("smtpPassword", {
                                required: !isEditing ? "SMTP Password is required" : false,
                            })}
                            placeholder={isEditing ? "Leave blank to keep current" : "Your app password"}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Settings</h3>
                
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fromEmail">From Email *</Label>
                        <Input
                            id="fromEmail"
                            {...register("fromEmail", {required: "From Email is required"})}
                            placeholder="noreply@yourapp.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                            id="fromName"
                            {...register("fromName")}
                            placeholder="Rugi Auth"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enabled</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable email sending for this app
                            </p>
                        </div>
                        <Controller
                            control={control}
                            name="enabled"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

export function EmailConfigList() {
    const [selectedApp, setSelectedApp] = useState<{
        app: App;
        config?: EmailConfig;
    } | null>(null);

    const {data: appsData, isLoading: isLoadingApps} = useQuery({
        queryKey: ["apps"],
        queryFn: () => apiClient.getApps({limit: 100}),
    });

    const apps = appsData?.data || [];

    // Fetch email config for each app
    const emailConfigQueries = apps.map((app) => ({
        queryKey: ["email-config", app.id],
        queryFn: () => apiClient.getEmailConfig(app.id),
        enabled: apps.length > 0,
    }));

    // We'll fetch configs individually as needed when opening the dialog
    // For now, we'll show a loading state when needed

    if (isLoadingApps) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => {
                    return (
                        <EmailConfigCard
                            key={app.id}
                            app={app}
                            onSelect={(config) => setSelectedApp({app, config})}
                        />
                    );
                })}
            </div>
            {apps.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No applications found. Create an application first.
                </div>
            )}

            {selectedApp && (
                <Dialog
                    open={!!selectedApp}
                    onOpenChange={(open) => {
                        if (!open) setSelectedApp(null);
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Email Configuration</DialogTitle>
                            <DialogDescription>
                                Configure email settings for {selectedApp.app.name}
                            </DialogDescription>
                        </DialogHeader>
                        <EmailConfigFormLoader
                            app={selectedApp.app}
                            onClose={() => setSelectedApp(null)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

function EmailConfigCard({
    app,
    onSelect,
}: {
    app: App;
    onSelect: (config?: EmailConfig) => void;
}) {
    const {data: config, isLoading} = useQuery({
        queryKey: ["email-config", app.id],
        queryFn: () => apiClient.getEmailConfig(app.id),
        retry: false, // Don't retry on 404
        onError: (error: any) => {
            // 404 is expected if config doesn't exist
            if (error.response?.status !== 404) {
                console.error("Error fetching email config:", error);
            }
        },
    });

    const isConfigured = !!config && !isLoading;
    const hasError = !isLoading && !config;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {app.name}
                </CardTitle>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                ) : isConfigured ? (
                    <Badge variant={config.enabled ? "default" : "secondary"}>
                        {config.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                ) : (
                    <Badge variant="secondary">Not Configured</Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{app.type}</div>
                <p className="text-xs text-muted-foreground mb-4">
                    {app.client_id.substring(0, 8)}...
                </p>
                {isConfigured && (
                    <div className="text-xs text-muted-foreground mb-4 space-y-1">
                        <p>From: {config.fromEmail}</p>
                        <p>Host: {config.smtpHost}:{config.smtpPort}</p>
                    </div>
                )}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onSelect(config)}
                >
                    <Mail className="mr-2 h-4 w-4"/>
                    {isConfigured ? "Edit Configuration" : "Configure Email"}
                </Button>
            </CardContent>
        </Card>
    );
}

function EmailConfigFormLoader({
    app,
    onClose,
}: {
    app: App;
    onClose: () => void;
}) {
    const {data: config, isLoading} = useQuery({
        queryKey: ["email-config", app.id],
        queryFn: () => apiClient.getEmailConfig(app.id),
        retry: false,
        onError: (error: any) => {
            // 404 is expected if config doesn't exist
            if (error.response?.status !== 404) {
                console.error("Error fetching email config:", error);
            }
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return <EmailConfigForm app={app} config={config} onClose={onClose} />;
}

