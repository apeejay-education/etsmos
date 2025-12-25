import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CapacitySettings } from '@/components/settings/CapacitySettings';

export default function Settings() {
  const { user, userRole, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            System configuration and administration
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
              <CardDescription>Current user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge className="capitalize">{userRole}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Info</CardTitle>
              <CardDescription>Management OS configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <p>1.1.0 (Resource Allocation)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Features</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary">Products</Badge>
                  <Badge variant="secondary">Initiatives</Badge>
                  <Badge variant="secondary">Execution Signals</Badge>
                  <Badge variant="secondary">Dashboard</Badge>
                  <Badge variant="secondary">Resource Allocation</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capacity Settings - Admin only */}
        <CapacitySettings />
      </div>
    </AppLayout>
  );
}
