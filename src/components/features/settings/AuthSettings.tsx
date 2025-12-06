import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {apiClient} from "@/lib/api";
import {App, AuthSettings, UpdateAuthSettingsRequest} from "@/types";
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
import {Loader2, Settings2} from "lucide-react";
import {useForm, Controller} from "react-hook-form";
import {Checkbox} from "@/components/ui/checkbox";

function AuthSettingsForm({
                              app,
                              settings,
                              onClose,
                          }: {
    app: App;
    settings?: AuthSettings;
    onClose: () => void;
}) {
    const {addToast} = useToast();
    const queryClient = useQueryClient();
    const isEditing = !!settings;

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: {isSubmitting},
    } = useForm<UpdateAuthSettingsRequest>({
        defaultValues: {
            email_password_enabled: settings?.email_password_enabled ?? true,
            email_otp_enabled: settings?.email_otp_enabled ?? false,
            require_email_verification: settings?.require_email_verification ?? true,
            allow_registration: settings?.allow_registration ?? true,
            google_auth_enabled: settings?.google_auth_enabled ?? false,
            google_client_id: settings?.google_client_id ?? "",
            google_client_secret: "", // Don't populate secret for security
            github_auth_enabled: settings?.github_auth_enabled ?? false,
            github_client_id: settings?.github_client_id ?? "",
            github_client_secret: "",
            microsoft_auth_enabled: settings?.microsoft_auth_enabled ?? false,
            microsoft_client_id: settings?.microsoft_client_id ?? "",
            microsoft_client_secret: "",
            facebook_auth_enabled: settings?.facebook_auth_enabled ?? false,
            facebook_client_id: settings?.facebook_client_id ?? "",
            facebook_client_secret: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: UpdateAuthSettingsRequest) =>
            apiClient.createAuthSettings(app.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["auth-settings"]});
            addToast({
                title: "Success",
                description: "Auth settings created successfully",
            });
            onClose();
        },
        onError: (error: any) => {
            addToast({
                title: "Error",
                description:
                    error.response?.data?.error || "Failed to create auth settings",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateAuthSettingsRequest) =>
            apiClient.updateAuthSettings(app.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["auth-settings"]});
            addToast({
                title: "Success",
                description: "Auth settings updated successfully",
            });
            onClose();
        },
        onError: (error: any) => {
            addToast({
                title: "Error",
                description:
                    error.response?.data?.error || "Failed to update auth settings",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: UpdateAuthSettingsRequest) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const watchGoogle = watch("google_auth_enabled");
    const watchGithub = watch("github_auth_enabled");
    const watchMicrosoft = watch("microsoft_auth_enabled");
    const watchFacebook = watch("facebook_auth_enabled");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">General Methods</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Email & Password</Label>
                        <p className="text-sm text-muted-foreground">
                            Allow users to sign in with email and password
                        </p>
                    </div>
                    <Controller
                        control={control}
                        name="email_password_enabled"
                        render={({field}) => (
                            <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Email OTP (Magic Link)</Label>
                        <p className="text-sm text-muted-foreground">
                            Allow password less sign in via email
                        </p>
                    </div>
                    <Controller
                        control={control}
                        name="email_otp_enabled"
                        render={({field}) => (
                            <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Registration</Label>
                        <p className="text-sm text-muted-foreground">
                            Allow new users to sign up
                        </p>
                    </div>
                    <Controller
                        control={control}
                        name="allow_registration"
                        render={({field}) => (
                            <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                            Require email verification before login
                        </p>
                    </div>
                    <Controller
                        control={control}
                        name="require_email_verification"
                        render={({field}) => (
                            <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">OAuth Providers</h3>

                {/* Google */}
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Google</Label>
                        </div>
                        <Controller
                            control={control}
                            name="google_auth_enabled"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    {watchGoogle && (
                        <div className="grid gap-4 pt-2">
                            <div className="grid gap-2">
                                <Label>Client ID</Label>
                                <Input
                                    {...register("google_client_id")}
                                    placeholder="Google Client ID"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Client Secret</Label>
                                <Input
                                    {...register("google_client_secret")}
                                    type="password"
                                    placeholder={
                                        isEditing
                                            ? "Leave blank to keep current"
                                            : "Google Client Secret"
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* GitHub */}
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">GitHub</Label>
                        </div>
                        <Controller
                            control={control}
                            name="github_auth_enabled"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    {watchGithub && (
                        <div className="grid gap-4 pt-2">
                            <div className="grid gap-2">
                                <Label>Client ID</Label>
                                <Input
                                    {...register("github_client_id")}
                                    placeholder="GitHub Client ID"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Client Secret</Label>
                                <Input
                                    {...register("github_client_secret")}
                                    type="password"
                                    placeholder={
                                        isEditing
                                            ? "Leave blank to keep current"
                                            : "GitHub Client Secret"
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Microsoft */}
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Microsoft</Label>
                        </div>
                        <Controller
                            control={control}
                            name="microsoft_auth_enabled"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    {watchMicrosoft && (
                        <div className="grid gap-4 pt-2">
                            <div className="grid gap-2">
                                <Label>Client ID</Label>
                                <Input
                                    {...register("microsoft_client_id")}
                                    placeholder="Microsoft Client ID"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Client Secret</Label>
                                <Input
                                    {...register("microsoft_client_secret")}
                                    type="password"
                                    placeholder={
                                        isEditing
                                            ? "Leave blank to keep current"
                                            : "Microsoft Client Secret"
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Facebook */}
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Facebook</Label>
                        </div>
                        <Controller
                            control={control}
                            name="facebook_auth_enabled"
                            render={({field}) => (
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    {watchFacebook && (
                        <div className="grid gap-4 pt-2">
                            <div className="grid gap-2">
                                <Label>Client ID</Label>
                                <Input
                                    {...register("facebook_client_id")}
                                    placeholder="Facebook Client ID"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Client Secret</Label>
                                <Input
                                    {...register("facebook_client_secret")}
                                    type="password"
                                    placeholder={
                                        isEditing
                                            ? "Leave blank to keep current"
                                            : "Facebook Client Secret"
                                    }
                                />
                            </div>
                        </div>
                    )}
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

export function AuthSettingsList() {
    const [selectedApp, setSelectedApp] = useState<{
        app: App;
        settings?: AuthSettings;
    } | null>(null);

    const {data: appsData, isLoading: isLoadingApps} = useQuery({
        queryKey: ["apps"],
        queryFn: () => apiClient.getApps({limit: 100}),
    });

    const {data: settingsData, isLoading: isLoadingSettings} = useQuery({
        queryKey: ["auth-settings"],
        queryFn: () => apiClient.getAllAuthSettings({limit: 100}),
    });

    if (isLoadingApps || isLoadingSettings) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    const apps = appsData?.data || [];
    const settingsArray: AuthSettings[] = settingsData?.data ?? [];
    const settingsMap = new Map<string, AuthSettings>(
        settingsArray.map((s: AuthSettings) => [s.app_id, s])
    );

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => {
                    const settings = settingsMap.get(app.id);
                    const isConfigured = !!settings;

                    return (
                        <Card key={app.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {app.name}
                                </CardTitle>
                                {isConfigured ? (
                                    <Badge variant="default">Configured</Badge>
                                ) : (
                                    <Badge variant="secondary">Not Configured</Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{app.type}</div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {app.client_id.substring(0, 8)}...
                                </p>
                                <Dialog
                                    open={selectedApp?.app.id === app.id}
                                    onOpenChange={(open) => {
                                        if (!open) setSelectedApp(null);
                                        else setSelectedApp({app, settings});
                                    }}
                                >
                                    <DialogTrigger>
                                        <div onClick={() => setSelectedApp({app, settings})}>
                                            <Settings2 className="mr-2 h-4 w-4"/>
                                            Configure Auth
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Authentication Settings</DialogTitle>
                                            <DialogDescription>
                                                Configure authentication methods for {app.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        {selectedApp && selectedApp.app.id === app.id && (
                                            <AuthSettingsForm
                                                app={app}
                                                settings={settings}
                                                onClose={() => setSelectedApp(null)}
                                            />
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {apps.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No applications found. Create an application first.
                </div>
            )}
        </div>
    );
}
