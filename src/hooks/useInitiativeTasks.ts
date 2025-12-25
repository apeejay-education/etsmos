import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InitiativeTask {
  id: string;
  initiative_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
  assigned_to: string | null;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: {
    id: string;
    full_name: string;
    department: string | null;
    role_title: string | null;
  };
}

export type TaskInsert = {
  initiative_id: string;
  title: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
  assigned_to?: string | null;
  status?: 'todo' | 'in_progress' | 'blocked' | 'done';
  due_date?: string | null;
};

export type TaskUpdate = Partial<Omit<TaskInsert, 'initiative_id'>> & { id: string };

export function useInitiativeTasks(initiativeId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['initiative-tasks', initiativeId],
    enabled: !!initiativeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiative_tasks')
        .select(`
          *,
          assignee:people!assigned_to(id, full_name, department, role_title)
        `)
        .eq('initiative_id', initiativeId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InitiativeTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from('initiative_tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks'] });
      toast({ title: 'Success', description: 'Task created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate) => {
      const { data, error } = await supabase
        .from('initiative_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks'] });
      toast({ title: 'Success', description: 'Task updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('initiative_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-tasks'] });
      toast({ title: 'Success', description: 'Task deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate task-based metrics
  const taskMetrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    blockedTasks: tasks.filter(t => t.status === 'blocked').length,
    totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
    completedHours: tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    taskMetrics,
  };
}
