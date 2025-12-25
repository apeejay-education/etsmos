import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InitiativeTask, TaskInsert, TaskUpdate } from '@/hooks/useInitiativeTasks';
import { format } from 'date-fns';

interface Person {
  id: string;
  full_name: string;
  department: string | null;
  role_title: string | null;
}

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initiativeId: string;
  editingId: string | null;
  tasks: InitiativeTask[];
  allocatedPeople: Person[];
  onCreate: (data: TaskInsert) => void;
  onUpdate: (data: TaskUpdate) => void;
}

export function TaskSheet({
  open,
  onClose,
  initiativeId,
  editingId,
  tasks,
  allocatedPeople,
  onCreate,
  onUpdate,
}: TaskSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'blocked' | 'done'>('todo');
  const [dueDate, setDueDate] = useState('');

  const isEditing = !!editingId;
  const editingTask = isEditing ? tasks.find(t => t.id === editingId) : null;

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setEstimatedHours(editingTask.estimated_hours);
      setAssignedTo(editingTask.assigned_to || '');
      setStatus(editingTask.status);
      setDueDate(editingTask.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setEstimatedHours(4);
      setAssignedTo('');
      setStatus('todo');
      setDueDate('');
    }
  }, [editingTask, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (isEditing && editingId) {
      onUpdate({
        id: editingId,
        title,
        description: description || null,
        priority,
        estimated_hours: estimatedHours,
        assigned_to: assignedTo || null,
        status,
        due_date: dueDate || null,
      });
    } else {
      onCreate({
        initiative_id: initiativeId,
        title,
        description: description || null,
        priority,
        estimated_hours: estimatedHours,
        assigned_to: assignedTo || null,
        status,
        due_date: dueDate || null,
      });
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Task' : 'Add Task'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the task details' : 'Create a new task for this initiative'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          {/* Priority and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                min={0}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select 
              value={assignedTo || 'unassigned'} 
              onValueChange={(v) => setAssignedTo(v === 'unassigned' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {allocatedPeople.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allocatedPeople.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add resources to the initiative first to assign tasks
              </p>
            )}
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim()} className="flex-1">
              {isEditing ? 'Update' : 'Add Task'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
