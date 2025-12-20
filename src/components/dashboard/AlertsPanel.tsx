import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Activity, EyeOff, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Alert, AlertType } from '@/hooks/useAlerts';

interface AlertsPanelProps {
  alerts: Alert[];
  maxItems?: number;
}

const alertIcons: Record<AlertType, typeof AlertTriangle> = {
  aging: Clock,
  blocked: AlertTriangle,
  health: Activity,
  silent: EyeOff
};

export function AlertsPanel({ alerts, maxItems = 10 }: AlertsPanelProps) {
  const navigate = useNavigate();
  const displayedAlerts = alerts.slice(0, maxItems);
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const handleNavigateToInitiative = (initiativeId: string) => {
    navigate(`/initiatives?highlight=${initiativeId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Alerts
              {criticalCount > 0 && (
                <Badge variant="destructive">{criticalCount} critical</Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  {warningCount} warning
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Active alerts requiring attention
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-500/10 p-3 mb-3">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium">All Clear</p>
            <p className="text-xs text-muted-foreground">No active alerts at this time</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {displayedAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                      alert.severity === 'critical' && 'border-destructive/50 bg-destructive/5',
                      alert.severity === 'warning' && 'border-yellow-500/50 bg-yellow-500/5'
                    )}
                    onClick={() => handleNavigateToInitiative(alert.initiativeId)}
                  >
                    <div className={cn(
                      'rounded-full p-1.5',
                      alert.severity === 'critical' && 'bg-destructive/10',
                      alert.severity === 'warning' && 'bg-yellow-500/10'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        alert.severity === 'critical' && 'text-destructive',
                        alert.severity === 'warning' && 'text-yellow-600'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {alert.initiativeTitle}
                      </p>
                      <p className="text-xs font-medium mt-0.5">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                      className={cn(
                        'shrink-0',
                        alert.severity === 'warning' && 'border-yellow-500 text-yellow-600'
                      )}
                    >
                      {alert.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {alerts.length > maxItems && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                +{alerts.length - maxItems} more alerts
              </p>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
