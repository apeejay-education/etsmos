import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { WorkloadBar } from '@/components/delegation/WorkloadBar';
import type { InitiativeAllocation } from '@/hooks/useInitiativeAllocations';
import type { InitiativeTask } from '@/hooks/useInitiativeTasks';
import type { CapacitySettings } from '@/hooks/useCapacitySettings';

interface ResourceTableProps {
  allocations: InitiativeAllocation[];
  tasks: InitiativeTask[];
  settings: CapacitySettings | null;
  initiative: { complexity?: string };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getRoleMultiplier: (role: string) => number;
  getComplexityMultiplier: (complexity: string) => number;
}

export function ResourceTable({
  allocations,
  tasks,
  settings,
  initiative,
  onEdit,
  onDelete,
  getRoleMultiplier,
  getComplexityMultiplier,
}: ResourceTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const calculateEffectiveLoad = (hours: number, role: string) => {
    const roleMultiplier = getRoleMultiplier(role);
    const complexityMultiplier = getComplexityMultiplier(initiative.complexity || 'medium');
    return hours * roleMultiplier * complexityMultiplier;
  };

  const getUtilizationStatus = (utilization: number): 'healthy' | 'warning' | 'overloaded' => {
    if (utilization > 90) return 'overloaded';
    if (utilization > 70) return 'warning';
    return 'healthy';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'lead':
        return 'default';
      case 'contributor':
        return 'secondary';
      case 'reviewer':
        return 'outline';
      case 'advisor':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (allocations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No resources allocated yet. Click "Add Resource" to assign team members.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Person</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Hours/wk</TableHead>
            <TableHead className="text-right">Effective Load</TableHead>
            <TableHead className="w-48">Utilization</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((allocation) => {
            const effectiveLoad = calculateEffectiveLoad(allocation.allocated_hours_per_week, allocation.role);
            const weeklyCapacity = settings?.weekly_capacity_hours || 40;
            const utilization = Math.round((effectiveLoad / weeklyCapacity) * 100);
            const status = getUtilizationStatus(utilization);
            const isExpanded = expandedRows.has(allocation.id);
            const personTasks = tasks.filter(t => t.assigned_to === allocation.person_id);

            return (
              <>
                <TableRow key={allocation.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(allocation.id)}>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{allocation.person?.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {allocation.person?.role_title} • {allocation.person?.department}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(allocation.role)} className="capitalize">
                      {allocation.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{allocation.allocated_hours_per_week}h</TableCell>
                  <TableCell className="text-right">{effectiveLoad.toFixed(1)}h</TableCell>
                  <TableCell>
                    <WorkloadBar
                      utilizationPercentage={utilization}
                      effectiveLoad={effectiveLoad}
                      category={status}
                      totalHours={allocation.allocated_hours_per_week}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(allocation.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(allocation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${allocation.id}-expanded`}>
                    <TableCell colSpan={7} className="bg-muted/30">
                      <div className="py-2 px-4">
                        <h4 className="text-sm font-medium mb-2">Assigned Tasks ({personTasks.length})</h4>
                        {personTasks.length > 0 ? (
                          <div className="space-y-2">
                            {personTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={`text-xs ${
                                    task.status === 'done' ? 'bg-green-500/10 text-green-600' :
                                    task.status === 'blocked' ? 'bg-red-500/10 text-red-600' :
                                    task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-sm">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{task.estimated_hours}h est.</span>
                                  {task.due_date && (
                                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tasks assigned to this person</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the resource allocation. Any assigned tasks will remain but become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
