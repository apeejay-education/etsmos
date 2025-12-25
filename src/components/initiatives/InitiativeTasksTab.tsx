import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInitiativeTasks } from '@/hooks/useInitiativeTasks';
import { useInitiativeAllocations } from '@/hooks/useInitiativeAllocations';
import { TaskTable } from './TaskTable';
import { TaskSheet } from './TaskSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface InitiativeTasksTabProps {
  initiativeId: string;
  canManage: boolean;
}

export function InitiativeTasksTab({ initiativeId, canManage }: InitiativeTasksTabProps) {
  const { tasks, isLoading, createTask, updateTask, deleteTask, taskMetrics } = useInitiativeTasks(initiativeId);
  const { allocations } = useInitiativeAllocations(initiativeId);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const handleEditTask = (taskId: string) => {
    setEditingTask(taskId);
    setTaskSheetOpen(true);
  };

  const handleCloseTaskSheet = () => {
    setTaskSheetOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const allocatedPeople = allocations.map(a => a.person!).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {taskMetrics.completedTasks}/{taskMetrics.totalTasks} done
          </Badge>
          <Badge variant="outline" className={taskMetrics.blockedTasks > 0 ? 'bg-red-500/10 text-red-600 border-red-500/20' : ''}>
            {taskMetrics.blockedTasks} blocked
          </Badge>
          <Badge variant="outline">
            {taskMetrics.totalEstimatedHours}h estimated
          </Badge>
        </div>
        {canManage && (
          <Button type="button" size="sm" onClick={() => setTaskSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        )}
      </div>

      {/* Task Table */}
      <TaskTable
        tasks={tasks}
        onEdit={canManage ? handleEditTask : () => {}}
        onDelete={canManage ? (id) => deleteTask.mutate(id) : () => {}}
        onStatusChange={(id, status) => updateTask.mutate({ id, status })}
      />

      {/* Task Sheet */}
      <TaskSheet
        open={taskSheetOpen}
        onClose={handleCloseTaskSheet}
        initiativeId={initiativeId}
        editingId={editingTask}
        tasks={tasks}
        allocatedPeople={allocatedPeople}
        onCreate={(data) => createTask.mutate(data)}
        onUpdate={(data) => updateTask.mutate(data)}
      />
    </div>
  );
}
