import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {AuthSettingsList} from "@/components/features/settings/AuthSettings"

export function Settings() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage system-wide configurations</p>
            </div>

            <Tabs defaultValue="authentication" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="authentication">Authentication</TabsTrigger>
                    <TabsTrigger value="general" disabled>General</TabsTrigger>
                    <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="authentication" className="space-y-4">
                    <div className="rounded-lg border p-6 bg-card text-card-foreground shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Authentication Settings</h2>
                            <p className="text-sm text-muted-foreground">
                                Configure how users sign in to your applications.
                            </p>
                        </div>
                        <AuthSettingsList/>
                    </div>
                </TabsContent>
                <TabsContent value="general">
                    <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">General settings coming soon</p>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="notifications">
                    <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Notification settings coming soon</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
