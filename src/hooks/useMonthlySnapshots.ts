import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonthlySnapshot {
  id: string;
  month_year: string;
  summary: string | null;
  key_deliveries: string | null;
  blockers_faced: string | null;
  lessons_learned: string | null;
  next_month_focus: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type MonthlySnapshotInsert = Omit<MonthlySnapshot, 'id' | 'created_at' | 'updated_at'>;
export type MonthlySnapshotUpdate = Partial<MonthlySnapshotInsert>;

export function useMonthlySnapshots() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snapshots = [], isLoading, error } = useQuery({
    queryKey: ['monthly_snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_snapshots')
        .select('*')
        .order('month_year', { ascending: false });
      
      if (error) throw error;
      return data as MonthlySnapshot[];
    },
  });

  const createSnapshot = useMutation({
    mutationFn: async (snapshot: MonthlySnapshotInsert) => {
      const { data, error } = await supabase
        .from('monthly_snapshots')
        .insert(snapshot)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly_snapshots'] });
      toast({ title: 'Success', description: 'Monthly snapshot created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateSnapshot = useMutation({
    mutationFn: async ({ id, ...updates }: MonthlySnapshotUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('monthly_snapshots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly_snapshots'] });
      toast({ title: 'Success', description: 'Monthly snapshot updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSnapshot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('monthly_snapshots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly_snapshots'] });
      toast({ title: 'Success', description: 'Monthly snapshot deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    snapshots,
    isLoading,
    error,
    createSnapshot,
    updateSnapshot,
    deleteSnapshot,
  };
}
