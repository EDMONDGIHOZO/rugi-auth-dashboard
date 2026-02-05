import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const formSchema = z.object({
    projectName: z.string().min(2, {
        message: "Project name must be at least 2 characters.",
    }),
});

export function GeneralSettings() {
    const { addToast: toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
        },
    });

    useEffect(() => {
        apiClient.getMeta().then((data) => {
            form.reset({
                projectName: data.projectName,
            });
        });
    }, [form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        apiClient
            .updateMeta(values)
            .then((data) => { // data is used implicitly
                toast({
                    title: "Settings updated",
                    description: `Project name set to ${data.projectName}. Refresh the page to see changes.`,
                });
                window.location.reload(); // Simple way to update sidebar
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update settings.",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border p-6 bg-card text-card-foreground shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">General Configuration</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure general system settings.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Rugi Auth" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name displayed in the dashboard sidebar and emails.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
