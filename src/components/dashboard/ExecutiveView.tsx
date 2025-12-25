import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useExecutiveMetrics } from '@/hooks/useExecutiveMetrics';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ExecutiveView() {
  const { data: metrics, isLoading } = useExecutiveMetrics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-48 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const { portfolio, byProduct, byDepartment, byPriority, decisionQueue, trends } = metrics;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolio.total}</div>
            <p className="text-xs text-muted-foreground">Active initiatives</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{portfolio.onTrackPercent}%</div>
            <p className="text-xs text-muted-foreground">{portfolio.onTrack} initiatives</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{portfolio.atRiskPercent}%</div>
            <p className="text-xs text-muted-foreground">{portfolio.atRisk} initiatives</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{portfolio.delayedPercent}%</div>
            <p className="text-xs text-muted-foreground">{portfolio.delayed} past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Buckets Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* By Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Product</CardTitle>
            <CardDescription>Initiative distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byProduct.slice(0, 5).map(product => (
                <div key={product.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{product.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{product.count}</span>
                      {product.atRisk > 0 && (
                        <Badge variant="destructive" className="text-xs h-5">
                          {product.atRisk} at risk
                        </Badge>
                      )}
                    </span>
                  </div>
                  <Progress 
                    value={(product.count / portfolio.total) * 100} 
                    className="h-1.5" 
                  />
                </div>
              ))}
              {byProduct.length === 0 && (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Department</CardTitle>
            <CardDescription>Team involvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byDepartment.slice(0, 5).map(dept => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{dept.name}</span>
                    <span className="font-medium">{dept.count}</span>
                  </div>
                  <Progress 
                    value={(dept.count / portfolio.total) * 100} 
                    className="h-1.5" 
                  />
                </div>
              ))}
              {byDepartment.length === 0 && (
                <p className="text-sm text-muted-foreground">No department data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Priority</CardTitle>
            <CardDescription>Priority distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="text-sm">High</span>
                </div>
                <Badge variant="destructive">{byPriority.high}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm">Medium</span>
                </div>
                <Badge>{byPriority.medium}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                  <span className="text-sm">Low</span>
                </div>
                <Badge variant="secondary">{byPriority.low}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Queue & Trends Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Decision Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Decision Queue</CardTitle>
            <CardDescription>Items requiring leadership attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                onClick={() => navigate('/initiatives?status=blocked')}
              >
                <div>
                  <p className="font-medium">Blocked &gt; 3 Days</p>
                  <p className="text-sm text-muted-foreground">Require escalation</p>
                </div>
                <Badge variant={decisionQueue.blockedLong > 0 ? 'destructive' : 'secondary'}>
                  {decisionQueue.blockedLong}
                </Badge>
              </div>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                onClick={() => navigate('/signals?health=red,amber')}
              >
                <div>
                  <p className="font-medium">High Priority at Risk</p>
                  <p className="text-sm text-muted-foreground">Red/Amber + High priority</p>
                </div>
                <Badge variant={decisionQueue.needsAttention > 0 ? 'destructive' : 'secondary'}>
                  {decisionQueue.needsAttention}
                </Badge>
              </div>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                onClick={() => navigate('/initiatives?status=approved')}
              >
                <div>
                  <p className="font-medium">Awaiting Start</p>
                  <p className="text-sm text-muted-foreground">Approved but not started</p>
                </div>
                <Badge variant="outline">{decisionQueue.awaitingApproval}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Trends</CardTitle>
            <CardDescription>Month-over-month performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Deliveries This Month</span>
                  <span className="text-2xl font-bold">{trends.thisMonthDelivered}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {trends.thisMonthDelivered > trends.lastMonthDelivered ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Up from {trends.lastMonthDelivered} last month</span>
                    </>
                  ) : trends.thisMonthDelivered < trends.lastMonthDelivered ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span>Down from {trends.lastMonthDelivered} last month</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4" />
                      <span>Same as last month ({trends.lastMonthDelivered})</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Trend</span>
                  <Badge 
                    variant={
                      trends.riskTrend === 'improving' ? 'default' :
                      trends.riskTrend === 'degrading' ? 'destructive' : 'secondary'
                    }
                    className={cn(
                      trends.riskTrend === 'improving' && 'bg-green-500'
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {trends.riskTrend === 'improving' && <TrendingUp className="h-3 w-3" />}
                      {trends.riskTrend === 'degrading' && <TrendingDown className="h-3 w-3" />}
                      {trends.riskTrend === 'stable' && <Minus className="h-3 w-3" />}
                      {trends.riskTrend.charAt(0).toUpperCase() + trends.riskTrend.slice(1)}
                    </span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on current at-risk ratio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
