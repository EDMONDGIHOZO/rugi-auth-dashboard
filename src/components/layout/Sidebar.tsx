import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    AppWindow,
    Users,
    FileText,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Applications", href: "/apps", icon: AppWindow },
    { name: "Users", href: "/users", icon: Users },
    { name: "Audit Logs", href: "/audit", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [projectName, setProjectName] = useState("Rugi Auth");

    useEffect(() => {
        apiClient.getMeta().then(data => {
            setProjectName(data.projectName || "Rugi Auth");
        }).catch(() => {
            // Silently fail to default
        });
    }, []);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </Button>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-64 border-r bg-secondary text-secondary-foreground transition-transform lg:translate-x-0",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-secondary-foreground/20 px-6">
                        <h1 className="text-sm font-bold tracking-tight uppercase truncate">
                            <span className={"font-black"}>{projectName}</span>
                            <span className={"font-light ml-1"}>DASHBOARD</span>
                        </h1>
                    </div>
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-secondary-foreground/80 hover:bg-primary/10 hover:text-primary-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
