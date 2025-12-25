import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useInitiativeTasks } from '@/hooks/useInitiativeTasks';
import { useInitiativeAllocations } from '@/hooks/useInitiativeAllocations';
import { TaskTable } from './TaskTable';
import { TaskSheet } from './TaskSheet';
import { Skeleton } from '@/components/ui/skeleton';

interface InitiativeTasksPageProps {
  initiativeId: string;
  canManage: boolean;
  canUpdateOwn: boolean;
}

export function InitiativeTasksPage({ initiativeId, canManage, canUpdateOwn }: InitiativeTasksPageProps) {
  const { tasks, isLoading, createTask, updateTask, deleteTask, taskMetrics } = useInitiativeTasks(initiativeId);
  const { allocations } = useInitiativeAllocations(initiativeId);
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const handleEdit = (taskId: string) => {
    setEditingId(taskId);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingId(null);
  };

  const allocatedPeople = allocations
    .map(a => a.person)
    .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);

  return (
    <div className="space-y-6">
      {/* Summary & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {taskMetrics.completedTasks}/{taskMetrics.totalTasks} Complete
          </Badge>
          {taskMetrics.blockedTasks > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {taskMetrics.blockedTasks} Blocked
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {taskMetrics.totalEstimatedHours}h estimated
          </Badge>
        </div>
        
        {canManage && (
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Task Table */}
      {tasks.length > 0 ? (
        <TaskTable
          tasks={tasks}
          onEdit={canManage ? handleEdit : undefined}
          onDelete={canManage ? (id) => deleteTask.mutate(id) : undefined}
          onStatusChange={(id, status) => updateTask.mutate({ id, status })}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No tasks yet.
              {canManage && ' Click "Add Task" to create the first task.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task Sheet */}
      <TaskSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        initiativeId={initiativeId}
        editingId={editingId}
        tasks={tasks}
        allocatedPeople={allocatedPeople}
        onCreate={(data) => createTask.mutate(data)}
        onUpdate={(data) => updateTask.mutate(data)}
      />
    </div>
  );
}
