import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { AppsList } from "@/pages/apps/AppsList";
import { AppDetail } from "@/pages/apps/AppDetail";
import { UsersList } from "@/pages/users/UsersList";
import { UserDetail } from "@/pages/users/UserDetail";
import { AuditLogs } from "@/pages/audit/AuditLogs";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/apps" element={<AppsList />} />
                <Route path="/apps/:id" element={<AppDetail />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
