import { useDashboard } from '@/hooks/useDashboard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

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

  const statCards = [
    {
      title: 'Open Initiatives',
      value: stats?.openInitiatives || 0,
      description: 'Active work items',
      icon: Target,
      variant: 'default' as const
    },
    {
      title: 'High Sensitivity',
      value: stats?.highSensitivityOpen || 0,
      description: 'Confidential items open',
      icon: AlertTriangle,
      variant: stats?.highSensitivityOpen ? 'destructive' as const : 'default' as const
    },
    {
      title: 'Blocked',
      value: stats?.blockedInitiatives || 0,
      description: 'Initiatives blocked',
      icon: AlertTriangle,
      variant: stats?.blockedInitiatives ? 'destructive' as const : 'default' as const
    },
    {
      title: 'Aging (14+ days)',
      value: stats?.agingInitiatives || 0,
      description: 'Stale initiatives',
      icon: Clock,
      variant: stats?.agingInitiatives ? 'warning' as const : 'default' as const
    },
    {
      title: 'Delivered This Month',
      value: stats?.deliveredThisMonth || 0,
      description: 'Completed initiatives',
      icon: CheckCircle2,
      variant: 'success' as const
    },
    {
      title: 'Red/Amber Signals',
      value: stats?.redAmberSignals || 0,
      description: 'Attention needed',
      icon: Activity,
      variant: stats?.redAmberSignals ? 'destructive' as const : 'default' as const
    },
    {
      title: 'Silent Initiatives',
      value: stats?.silentInitiatives || 0,
      description: 'No recent activity',
      icon: EyeOff,
      variant: stats?.silentInitiatives ? 'warning' as const : 'default' as const
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Decision-to-outcome intelligence at a glance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className={cn(
              stat.variant === 'destructive' && 'border-destructive/50 bg-destructive/5',
              stat.variant === 'success' && 'border-green-500/50 bg-green-500/5',
              stat.variant === 'warning' && 'border-yellow-500/50 bg-yellow-500/5'
            )}>
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
                    className="flex items-center justify-between p-4 border rounded-lg"
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
      </div>
    </AppLayout>
  );
}
