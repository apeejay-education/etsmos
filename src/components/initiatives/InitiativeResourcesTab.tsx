import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useInitiativeAllocations } from '@/hooks/useInitiativeAllocations';
import { useInitiativeTasks } from '@/hooks/useInitiativeTasks';
import { useCapacitySettings } from '@/hooks/useCapacitySettings';
import { usePeople } from '@/hooks/usePeople';
import { ResourceTable } from './ResourceTable';
import { AllocationSheet } from './AllocationSheet';
import { Initiative } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface InitiativeResourcesTabProps {
  initiativeId: string;
  initiative: Initiative;
  canAllocate: boolean;
}

export function InitiativeResourcesTab({ initiativeId, initiative, canAllocate }: InitiativeResourcesTabProps) {
  const { allocations, isLoading, createAllocation, updateAllocation, deleteAllocation } = useInitiativeAllocations(initiativeId);
  const { tasks } = useInitiativeTasks(initiativeId);
  const { settings, getRoleMultiplier, getComplexityMultiplier } = useCapacitySettings();
  const { people } = usePeople();
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const calculateEffectiveLoad = (hours: number, role: string) => {
    const roleMultiplier = getRoleMultiplier(role);
    const complexityMultiplier = getComplexityMultiplier(initiative.complexity || 'medium');
    return hours * roleMultiplier * complexityMultiplier;
  };

  const totalResources = allocations.length;
  const totalAllocatedHours = allocations.reduce((sum, a) => sum + a.allocated_hours_per_week, 0);
  const totalEffectiveLoad = allocations.reduce((sum, a) => sum + calculateEffectiveLoad(a.allocated_hours_per_week, a.role), 0);
  const weeklyCapacity = settings?.weekly_capacity_hours || 40;
  const avgUtilization = totalResources > 0 
    ? Math.round((totalEffectiveLoad / (totalResources * weeklyCapacity)) * 100)
    : 0;
  
  const overloadedCount = allocations.filter(a => {
    const load = calculateEffectiveLoad(a.allocated_hours_per_week, a.role);
    return (load / weeklyCapacity) * 100 > 90;
  }).length;

  // Get available people for allocation (not already allocated)
  const allocatedPersonIds = new Set(allocations.map(a => a.person_id));
  const availablePeople = people.filter(p => !allocatedPersonIds.has(p.id) && p.is_active);

  const handleEdit = (allocationId: string) => {
    setEditingId(allocationId);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Allocated Hours/wk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocatedHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgUtilization > 90 ? 'text-destructive' : avgUtilization > 70 ? 'text-amber-600' : 'text-green-600'}`}>
              {avgUtilization}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overloaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overloadedCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {overloadedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {canAllocate && (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      )}

      {/* Resource Table */}
      {allocations.length > 0 ? (
        <ResourceTable
          allocations={allocations}
          tasks={tasks}
          settings={settings}
          initiative={initiative}
          onEdit={canAllocate ? handleEdit : undefined}
          onDelete={canAllocate ? (id) => deleteAllocation.mutate(id) : undefined}
          getRoleMultiplier={getRoleMultiplier}
          getComplexityMultiplier={getComplexityMultiplier}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No resources allocated yet.
              {canAllocate && ' Click "Add Resource" to assign team members.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Allocation Sheet */}
      <AllocationSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        initiativeId={initiativeId}
        complexity={initiative.complexity || 'medium'}
        editingId={editingId}
        allocations={allocations}
        availablePeople={availablePeople}
        allPeople={people}
        settings={settings}
        getRoleMultiplier={getRoleMultiplier}
        getComplexityMultiplier={getComplexityMultiplier}
        onCreate={(data) => createAllocation.mutate(data)}
        onUpdate={(data) => updateAllocation.mutate(data)}
      />
    </div>
  );
}
