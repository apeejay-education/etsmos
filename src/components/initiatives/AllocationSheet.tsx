import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { InitiativeAllocation, AllocationInsert, AllocationUpdate } from '@/hooks/useInitiativeAllocations';
import type { CapacitySettings } from '@/hooks/useCapacitySettings';
import { format } from 'date-fns';

interface Person {
  id: string;
  full_name: string;
  department: string | null;
  role_title: string | null;
}

interface AllocationSheetProps {
  open: boolean;
  onClose: () => void;
  initiativeId: string;
  complexity: string;
  editingId: string | null;
  allocations: InitiativeAllocation[];
  availablePeople: Person[];
  allPeople: Person[];
  settings: CapacitySettings | null;
  getRoleMultiplier: (role: string) => number;
  getComplexityMultiplier: (complexity: string) => number;
  onCreate: (data: AllocationInsert) => void;
  onUpdate: (data: AllocationUpdate) => void;
}

export function AllocationSheet({
  open,
  onClose,
  initiativeId,
  complexity,
  editingId,
  allocations,
  availablePeople,
  allPeople,
  settings,
  getRoleMultiplier,
  getComplexityMultiplier,
  onCreate,
  onUpdate,
}: AllocationSheetProps) {
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState<'lead' | 'contributor'>('contributor');
  const [hours, setHours] = useState(8);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');

  const isEditing = !!editingId;
  const editingAllocation = isEditing ? allocations.find(a => a.id === editingId) : null;

  useEffect(() => {
    if (editingAllocation) {
      setPersonId(editingAllocation.person_id);
      // Default to 'contributor' if role is not 'lead'
      const validRole = editingAllocation.role === 'lead' ? 'lead' : 'contributor';
      setRole(validRole);
      setHours(editingAllocation.allocated_hours_per_week);
      setStartDate(editingAllocation.start_date);
      setEndDate(editingAllocation.end_date || '');
    } else {
      setPersonId('');
      setRole('contributor');
      setHours(8);
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEndDate('');
    }
  }, [editingAllocation, open]);

  // Calculate live utilization preview
  const calculateUtilization = () => {
    if (!personId || !settings) return null;

    const roleMultiplier = getRoleMultiplier(role);
    const complexityMultiplier = getComplexityMultiplier(complexity);
    const effectiveLoad = hours * roleMultiplier * complexityMultiplier;
    const utilization = (effectiveLoad / settings.weekly_capacity_hours) * 100;

    return {
      effectiveLoad,
      utilization: Math.round(utilization),
      status: utilization > 90 ? 'overloaded' : utilization > 70 ? 'warning' : 'healthy',
    };
  };

  const preview = calculateUtilization();
  const peopleToShow = isEditing ? allPeople : availablePeople;

  const handleSubmit = () => {
    if (!personId) return;

    if (isEditing && editingId) {
      onUpdate({
        id: editingId,
        role,
        allocated_hours_per_week: hours,
        start_date: startDate,
        end_date: endDate || null,
      });
    } else {
      onCreate({
        initiative_id: initiativeId,
        person_id: personId,
        role,
        allocated_hours_per_week: hours,
        start_date: startDate,
        end_date: endDate || null,
      });
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Resource Allocation' : 'Add Resource'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the allocation details' : 'Assign a team member to this initiative'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Person Selection */}
          <div className="space-y-2">
            <Label>Person</Label>
            <Select value={personId} onValueChange={setPersonId} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {peopleToShow.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex flex-col">
                      <span>{person.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {person.role_title} • {person.department}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead (1.2x multiplier)</SelectItem>
                <SelectItem value="contributor">Contributor (1.0x multiplier)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hours per Week */}
          <div className="space-y-2">
            <Label>Hours per Week</Label>
            <Input
              type="number"
              min={1}
              max={40}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Live Preview */}
          {preview && personId && (
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Utilization Preview</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Effective Load:</span>
                  <span className="font-medium">{preview.effectiveLoad.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization:</span>
                  <Badge variant="outline" className={`
                    ${preview.status === 'overloaded' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                      preview.status === 'warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                      'bg-green-500/10 text-green-600 border-green-500/30'}
                  `}>
                    {preview.utilization}%
                  </Badge>
                </div>
                {preview.status === 'overloaded' && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ This allocation will result in overloading
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!personId} className="flex-1">
              {isEditing ? 'Update' : 'Add Resource'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
