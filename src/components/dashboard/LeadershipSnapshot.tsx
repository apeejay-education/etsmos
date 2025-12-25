import { useLeadershipSnapshot } from '@/hooks/useLeadershipSnapshot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  EyeOff, 
  TrendingUp,
  BarChart3 
} from 'lucide-react';

export function LeadershipSnapshot() {
  const { data: snapshot, isLoading } = useLeadershipSnapshot();
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (!snapshot) return null;
  
  const statusBreakdown = [
    { label: 'Approved', value: snapshot.initiativesByStatus['approved'] || 0, color: 'bg-blue-500' },
    { label: 'In Progress', value: snapshot.initiativesByStatus['in_progress'] || 0, color: 'bg-yellow-500' },
    { label: 'Blocked', value: snapshot.initiativesByStatus['blocked'] || 0, color: 'bg-red-500' },
  ];
  
  const totalActive = statusBreakdown.reduce((sum, s) => sum + s.value, 0);
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{snapshot.totalInitiatives}</p>
                <p className="text-sm text-muted-foreground">Active Initiatives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={snapshot.blockedInitiatives > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{snapshot.blockedInitiatives}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={snapshot.overdueContributions > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{snapshot.overdueContributions}</p>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={snapshot.silentInitiatives > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <EyeOff className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{snapshot.silentInitiatives}</p>
                <p className="text-sm text-muted-foreground">Silent (7+ days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusBreakdown.map(status => (
              <div key={status.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{status.label}</span>
                  <span className="font-medium">{status.value}</span>
                </div>
                <Progress 
                  value={totalActive > 0 ? (status.value / totalActive) * 100 : 0} 
                  className={`h-2 ${status.color}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-600">
                  {snapshot.initiativesByPriority['high'] || 0}
                </p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-600">
                  {snapshot.initiativesByPriority['medium'] || 0}
                </p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">
                  {snapshot.initiativesByPriority['low'] || 0}
                </p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
