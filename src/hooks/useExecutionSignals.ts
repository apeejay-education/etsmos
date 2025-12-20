import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExecutionSignal } from '@/types/database';
import { toast } from 'sonner';

export function useExecutionSignals() {
  return useQuery({
    queryKey: ['execution-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_signals')
        .select('*, initiatives(title, status, priority_level, sensitivity_level, product_id, products(name))')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as (ExecutionSignal & { 
        initiatives: { 
          title: string; 
          status: string;
          priority_level: string;
          sensitivity_level: string;
          product_id: string;
          products: { name: string };
        } 
      })[];
    }
  });
}

export function useExecutionSignal(initiativeId: string) {
  return useQuery({
    queryKey: ['execution-signals', initiativeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_signals')
        .select('*')
        .eq('initiative_id', initiativeId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ExecutionSignal | null;
    },
    enabled: !!initiativeId
  });
}

export function useCreateExecutionSignal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (signal: Omit<ExecutionSignal, 'id' | 'created_at' | 'updated_at' | 'initiatives'>) => {
      const { data, error } = await supabase
        .from('execution_signals')
        .insert(signal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-signals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Execution signal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create execution signal: ' + error.message);
    }
  });
}

export function useUpdateExecutionSignal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...signal }: Partial<ExecutionSignal> & { id: string }) => {
      const { data, error } = await supabase
        .from('execution_signals')
        .update(signal)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-signals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Execution signal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update execution signal: ' + error.message);
    }
  });
}
