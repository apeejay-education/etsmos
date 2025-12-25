import { useDashboard } from '@/hooks/useDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAlerts } from '@/hooks/useAlerts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity,
  EyeOff,
  BarChart3,
  Bell,
  Rocket,
  AlertCircle,
  Briefcase,
  Focus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeliveryTrendsChart } from '@/components/dashboard/DeliveryTrendsChart';
import { HealthDistributionChart } from '@/components/dashboard/HealthDistributionChart';
import { ContributionStatsChart } from '@/components/dashboard/ContributionStatsChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { ExecutiveView } from '@/components/dashboard/ExecutiveView';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isViewer = userRole === 'viewer';
  const { data, isLoading } = useDashboard();
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  // Show personalized dashboard for viewers
  if (isViewer) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">Your initiatives, contributions, and upcoming deadlines</p>
          </div>
          <UserDashboard />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = data?.stats;
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;

  const statCards = [
    {
      title: 'Open Initiatives',
      value: stats?.openInitiatives || 0,
      description: 'Active work items',
      icon: Target,
      variant: 'default' as const,
      onClick: () => navigate('/initiatives?status=approved,in_progress,blocked')
    },
    {
      title: 'Upcoming Launches',
      value: stats?.upcomingLaunches || 0,
      description: 'Launching within 10 days',
      icon: Rocket,
      variant: stats?.upcomingLaunches ? 'success' as const : 'default' as const,
      onClick: () => navigate('/initiatives?upcoming=true')
    },
    {
      title: 'At Risk',
      value: stats?.atRiskInitiatives || 0,
      description: 'Due soon but not in progress',
      icon: AlertCircle,
      variant: stats?.atRiskInitiatives ? 'destructive' as const : 'default' as const,
      onClick: () => navigate('/initiatives?atrisk=true')
    },
    {
      title: 'Blocked',
      value: stats?.blockedInitiatives || 0,
      description: 'Initiatives blocked',
      icon: AlertTriangle,
      variant: stats?.blockedInitiatives ? 'destructive' as const : 'default' as const,
      onClick: () => navigate('/initiatives?status=blocked')
    },
    {
      title: 'Aging (14+ days)',
      value: stats?.agingInitiatives || 0,
      description: 'Stale initiatives',
      icon: Clock,
      variant: stats?.agingInitiatives ? 'warning' as const : 'default' as const,
      onClick: () => navigate('/initiatives?aging=true')
    },
    {
      title: 'Delivered This Month',
      value: stats?.deliveredThisMonth || 0,
      description: 'Completed initiatives',
      icon: CheckCircle2,
      variant: 'success' as const,
      onClick: () => navigate('/initiatives?status=delivered')
    },
    {
      title: 'Red/Amber Signals',
      value: stats?.redAmberSignals || 0,
      description: 'Attention needed',
      icon: Activity,
      variant: stats?.redAmberSignals ? 'destructive' as const : 'default' as const,
      onClick: () => navigate('/signals?health=red,amber')
    },
    {
      title: 'Silent Initiatives',
      value: stats?.silentInitiatives || 0,
      description: 'No recent activity',
      icon: EyeOff,
      variant: stats?.silentInitiatives ? 'warning' as const : 'default' as const,
      onClick: () => navigate('/initiatives?silent=true')
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
            <p className="text-muted-foreground">
              Decision-to-outcome intelligence at a glance
            </p>
          </div>
          {criticalAlerts > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Bell className="h-3 w-3" />
              {criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card 
              key={stat.title} 
              className={cn(
                'cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
                stat.variant === 'destructive' && 'border-destructive/50 bg-destructive/5',
                stat.variant === 'success' && 'border-green-500/50 bg-green-500/5',
                stat.variant === 'warning' && 'border-yellow-500/50 bg-yellow-500/5'
              )}
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn(
                  'h-4 w-4',
                  stat.variant === 'destructive' && 'text-destructive',
                  stat.variant === 'success' && 'text-green-500',
                  stat.variant === 'warning' && 'text-yellow-500',
                  stat.variant === 'default' && 'text-muted-foreground'
                )} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="executive" className="space-y-4">
          <TabsList>
            <TabsTrigger value="executive" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Executive View
            </TabsTrigger>
            <TabsTrigger value="focus" className="gap-2">
              <Focus className="h-4 w-4" />
              Today's Focus
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
              {(alerts?.length || 0) > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {alerts?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-4">
            <ExecutiveView />
          </TabsContent>

          <TabsContent value="focus" className="space-y-4">
            <TodaysFocus />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analyticsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[380px] bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <DeliveryTrendsChart data={analyticsData?.deliveryTrends || []} />
                <HealthDistributionChart data={analyticsData?.healthDistribution || []} />
                <ContributionStatsChart data={analyticsData?.contributionStats || []} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts">
            {alertsLoading ? (
              <div className="h-[400px] bg-muted rounded animate-pulse" />
            ) : (
              <AlertsPanel alerts={alerts || []} maxItems={15} />
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {/* Upcoming Launches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-green-500" />
                  Upcoming Launches
                </CardTitle>
                <CardDescription>
                  Initiatives in progress, launching within 10 business days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.upcomingLaunchList?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming launches scheduled.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data?.upcomingLaunchList?.map((initiative) => (
                      <div
                        key={initiative.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-green-500/30 bg-green-500/5"
                        onClick={() => navigate(`/initiatives?search=${encodeURIComponent(initiative.title)}`)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{initiative.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {initiative.products?.name || 'No product'} • Due: {initiative.tentative_delivery_date ? format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy') : 'Not set'}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          In Progress
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* At Risk Initiatives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  At Risk
                </CardTitle>
                <CardDescription>
                  Due within 10 days but status is Blocked or Approved (not started)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.atRiskList?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No at-risk initiatives.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data?.atRiskList?.map((initiative) => (
                      <div
                        key={initiative.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-destructive/30 bg-destructive/5"
                        onClick={() => navigate(`/initiatives?search=${encodeURIComponent(initiative.title)}`)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{initiative.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {initiative.products?.name || 'No product'} • Due: {initiative.tentative_delivery_date ? format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy') : 'Not set'}
                          </p>
                        </div>
                        <Badge variant="destructive">
                          {initiative.status === 'blocked' ? 'Blocked' : 'Not Started'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Initiatives */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Initiatives</CardTitle>
                <CardDescription>
                  Latest initiatives across all products
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.recentInitiatives?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No initiatives yet. Create your first initiative to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data?.recentInitiatives?.map((initiative) => (
                      <div
                        key={initiative.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/initiatives?search=${encodeURIComponent(initiative.title)}`)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{initiative.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {initiative.products?.name || 'No product'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            initiative.priority_level === 'high' ? 'destructive' :
                            initiative.priority_level === 'medium' ? 'default' : 'secondary'
                          }>
                            {initiative.priority_level}
                          </Badge>
                          <Badge variant={
                            initiative.status === 'delivered' ? 'default' :
                            initiative.status === 'blocked' ? 'destructive' :
                            'outline'
                          }>
                            {initiative.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
