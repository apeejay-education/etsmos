import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Initiative } from '@/types/database';
import { toast } from 'sonner';

export function useInitiatives() {
  return useQuery({
    queryKey: ['initiatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*, products(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Initiative & { products: { name: string } })[];
    }
  });
}

export function useInitiative(id: string) {
  return useQuery({
    queryKey: ['initiatives', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*, products(*)')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Initiative | null;
    },
    enabled: !!id
  });
}

export function useCreateInitiative() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (initiative: Omit<Initiative, 'id' | 'created_at' | 'updated_at' | 'products'>) => {
      const { data, error } = await supabase
        .from('initiatives')
        .insert(initiative)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Initiative created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create initiative: ' + error.message);
    }
  });
}

export function useUpdateInitiative() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...initiative }: Partial<Initiative> & { id: string }) => {
      const { data, error } = await supabase
        .from('initiatives')
        .update(initiative)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Initiative updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update initiative: ' + error.message);
    }
  });
}

export function useDeleteInitiative() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Initiative deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete initiative: ' + error.message);
    }
  });
}
