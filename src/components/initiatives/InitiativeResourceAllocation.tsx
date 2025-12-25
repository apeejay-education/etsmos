import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInitiativeAllocations, AllocationInsert } from '@/hooks/useInitiativeAllocations';
import { usePeople } from '@/hooks/usePeople';
import { useCapacitySettings } from '@/hooks/useCapacitySettings';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InitiativeResourceAllocationProps {
  initiativeId: string;
  complexity: string;
  canEdit: boolean;
}

export function InitiativeResourceAllocation({ 
  initiativeId, 
  complexity,
  canEdit 
}: InitiativeResourceAllocationProps) {
  const { allocations, isLoading, createAllocation, updateAllocation, deleteAllocation } = useInitiativeAllocations(initiativeId);
  const { people } = usePeople();
  const { settings, getRoleMultiplier, getComplexityMultiplier } = useCapacitySettings();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newAllocation, setNewAllocation] = useState<{
    person_id: string;
    role: 'lead' | 'contributor' | 'reviewer' | 'advisor';
    allocated_hours_per_week: number;
    start_date: string;
    end_date: string;
  }>({
    person_id: '',
    role: 'contributor',
    allocated_hours_per_week: 8,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  // Get available people (not already allocated)
  const allocatedPersonIds = new Set(allocations.map(a => a.person_id));
  const availablePeople = people.filter(p => p.is_active && !allocatedPersonIds.has(p.id));

  const handleAdd = () => {
    if (!newAllocation.person_id) return;
    
    const allocationData: AllocationInsert = {
      initiative_id: initiativeId,
      person_id: newAllocation.person_id,
      role: newAllocation.role,
      allocated_hours_per_week: newAllocation.allocated_hours_per_week,
      start_date: newAllocation.start_date,
      end_date: newAllocation.end_date || null,
    };
    
    createAllocation.mutate(allocationData, {
      onSuccess: () => {
        setShowAddForm(false);
        setNewAllocation({
          person_id: '',
          role: 'contributor',
          allocated_hours_per_week: 8,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
        });
      },
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteAllocation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const calculateEffectiveLoad = (hours: number, role: string) => {
    const roleMultiplier = getRoleMultiplier(role);
    const complexityMultiplier = getComplexityMultiplier(complexity);
    return hours * roleMultiplier * complexityMultiplier;
  };

  const weeklyCapacity = settings?.weekly_capacity_hours || 40;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Resource Allocation</h4>
          <p className="text-sm text-muted-foreground">
            Assign team members with their weekly time allocation
          </p>
        </div>
        {canEdit && !showAddForm && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Person
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && canEdit && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Person</Label>
              <Select
                value={newAllocation.person_id}
                onValueChange={(v) => setNewAllocation({ ...newAllocation, person_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} {p.department && `(${p.department})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={newAllocation.role}
                onValueChange={(v: 'lead' | 'contributor' | 'reviewer' | 'advisor') => 
                  setNewAllocation({ ...newAllocation, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Hours/Week</Label>
              <Input
                type="number"
                min={1}
                max={80}
                value={newAllocation.allocated_hours_per_week}
                onChange={(e) => setNewAllocation({ 
                  ...newAllocation, 
                  allocated_hours_per_week: parseInt(e.target.value) || 8 
                })}
              />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newAllocation.start_date}
                onChange={(e) => setNewAllocation({ ...newAllocation, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>End Date (optional)</Label>
              <Input
                type="date"
                value={newAllocation.end_date}
                onChange={(e) => setNewAllocation({ ...newAllocation, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newAllocation.person_id || createAllocation.isPending}>
              {createAllocation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add Allocation'
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Allocations Table */}
      {allocations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Hours/Week</TableHead>
              <TableHead className="text-center">Effective Load</TableHead>
              <TableHead>Dates</TableHead>
              {canEdit && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((alloc) => {
              const effectiveLoad = calculateEffectiveLoad(alloc.allocated_hours_per_week, alloc.role);
              const utilizationPct = Math.round((effectiveLoad / weeklyCapacity) * 100);
              
              return (
                <TableRow key={alloc.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{alloc.person?.full_name}</div>
                      {alloc.person?.department && (
                        <div className="text-xs text-muted-foreground">{alloc.person.department}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {alloc.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {alloc.allocated_hours_per_week}h
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">
                      {effectiveLoad.toFixed(1)}h ({utilizationPct}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(alloc.start_date).toLocaleDateString()}
                      {alloc.end_date && (
                        <> → {new Date(alloc.end_date).toLocaleDateString()}</>
                      )}
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(alloc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No resource allocations yet. {canEdit && 'Click "Add Person" to assign team members.'}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the resource allocation. The person will no longer be counted in workload calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
