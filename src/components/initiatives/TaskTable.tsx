import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { InitiativeTask } from '@/hooks/useInitiativeTasks';
import { format } from 'date-fns';

interface TaskTableProps {
  tasks: InitiativeTask[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'todo' | 'in_progress' | 'blocked' | 'done') => void;
}

export function TaskTable({ tasks, onEdit, onDelete, onStatusChange }: TaskTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'blocked':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'todo':
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tasks created yet. Click "Add Task" to create your first task.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Est. Hours</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {task.assignee ? (
                  <div>
                    <div className="text-sm">{task.assignee.full_name}</div>
                    <div className="text-xs text-muted-foreground">{task.assignee.role_title}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell className="text-right">{task.estimated_hours}h</TableCell>
              <TableCell>
                {task.due_date ? (
                  <span className={new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-600' : ''}>
                    {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={task.status}
                  onValueChange={(value) => onStatusChange(task.id, value as 'todo' | 'in_progress' | 'blocked' | 'done')}
                >
                  <SelectTrigger className={`w-32 h-8 text-xs border ${getStatusStyles(task.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
