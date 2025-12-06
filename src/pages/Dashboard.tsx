import {useQuery} from '@tanstack/react-query'
import {apiClient} from '@/lib/api'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Users, Activity, TrendingUp, AppWindow} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

export function Dashboard() {
    const {data: appsData} = useQuery({
        queryKey: ["apps"],
        queryFn: () => apiClient.getApps({limit: 100}),
    });

    const {data: usersData} = useQuery({
        queryKey: ["users"],
        queryFn: () => apiClient.getUsers({limit: 100}),
    });

    const {data: auditData} = useQuery({
        queryKey: ["audit", "recent"],
        queryFn: () => apiClient.getAuditLogs({limit: 10}),
    });

    const {data: recentAuditData} = useQuery({
        queryKey: ["audit", "last24h"],
        queryFn: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return apiClient.getAuditLogs({
                start_date: yesterday.toISOString(),
                limit: 100,
            });
        },
    });

    const totalUsers = usersData?.pagination.total || 0;
    const totalApps = appsData?.pagination.total || 0;
    const recentAuditCount = recentAuditData?.data.length || 0;

    // Prepare chart data
    const registrationData =
        usersData?.data
            .map((user) => ({
                date: new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                count: 1,
            }))
            .reduce((acc: any[], curr) => {
                const existing = acc.find((item) => item.date === curr.date);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, []) || [];

    const loginData =
        recentAuditData?.data
            .filter((log) => log.action === "LOGIN")
            .map((log) => ({
                date: new Date(log.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                count: 1,
            }))
            .reduce((acc: any[], curr) => {
                const existing = acc.find((item) => item.date === curr.date);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, []) || [];

    const appTypeData =
        appsData?.data.reduce((acc: any[], app) => {
            const existing = acc.find((item) => item.name === app.type);
            if (existing) {
                existing.value++;
            } else {
                acc.push({name: app.type, value: 1});
            }
            return acc;
        }, []) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your authentication service
                    </p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Applications
                        </CardTitle>
                        <AppWindow className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApps}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered applications
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentAuditCount}</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Sessions
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">
                            Refresh tokens active
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Registrations</CardTitle>
                        <CardDescription>Registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={registrationData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    name="Registrations"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Login Activity</CardTitle>
                        <CardDescription>Logins by day (last 24h)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={loginData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="count" fill="#8b5cf6" name="Logins"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Application Type Distribution</CardTitle>
                    <CardDescription>Distribution of app types</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={appTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({name, percent}) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {appTypeData.map((_, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest audit log entries</CardDescription>
                        </div>
                        <Link to="/audit">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {auditData?.data.length ? (
                        <div className="space-y-4">
                            {auditData.data.slice(0, 5).map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.user?.email || "System"} •{" "}
                                            {formatDistanceToNow(new Date(log.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

