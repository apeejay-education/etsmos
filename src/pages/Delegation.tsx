import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useDelegation } from '@/hooks/useDelegation';
import { useCapacitySettings } from '@/hooks/useCapacitySettings';
import { DelegationTable } from '@/components/delegation/DelegationTable';

export default function Delegation() {
  const { data, isLoading } = useDelegation();
  const { settings } = useCapacitySettings();
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get unique departments for filter
  const departments = useMemo(() => {
    if (!data) return [];
    const depts = new Set(data.map(p => p.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [data]);

  // Summary stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, healthy: 0, warning: 0, overloaded: 0, avgUtilization: 0 };
    const total = data.length;
    const avgUtilization = total > 0 
      ? Math.round(data.reduce((sum, p) => sum + p.utilizationPercentage, 0) / total)
      : 0;
    return {
      total,
      healthy: data.filter(p => p.workloadCategory === 'healthy').length,
      warning: data.filter(p => p.workloadCategory === 'warning').length,
      overloaded: data.filter(p => p.workloadCategory === 'overloaded').length,
      avgUtilization,
    };
  }, [data]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delegation Dashboard</h1>
          <p className="text-muted-foreground">
            Time-based resource allocation and workload visibility
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total People</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">With active allocations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgUtilization}%</div>
              <p className="text-xs text-muted-foreground">Of {settings?.weekly_capacity_hours || 40}h capacity</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
              <p className="text-xs text-muted-foreground">0-70% utilization</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <p className="text-xs text-muted-foreground">71-90% utilization</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overloaded}</div>
              <p className="text-xs text-muted-foreground">91%+ utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>
              Click on a row to see assigned initiatives. Sorted by workload score (highest first).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">Has High</SelectItem>
                    <SelectItem value="medium">Has Medium</SelectItem>
                    <SelectItem value="low">Has Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DelegationTable
              data={data || []}
              departmentFilter={departmentFilter}
              priorityFilter={priorityFilter}
              statusFilter={statusFilter}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
