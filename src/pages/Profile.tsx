import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email Verified
              </p>
              <Badge variant={user?.isEmailVerified ? "default" : "secondary"}>
                {user?.isEmailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                MFA Enabled
              </p>
              <Badge variant={user?.mfaEnabled ? "default" : "outline"}>
                {user?.mfaEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {user?.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Account Created
                </p>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>API endpoint information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Base URL
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Token Expiry
              </p>
              <p className="text-sm">Configured via backend</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Password changes and MFA setup should be handled through the
                authentication service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
