import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InitiativeAllocation {
  id: string;
  initiative_id: string;
  person_id: string;
  role: 'lead' | 'contributor' | 'reviewer' | 'advisor';
  allocated_hours_per_week: number;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  person?: {
    id: string;
    full_name: string;
    department: string | null;
    role_title: string | null;
  };
  initiative?: {
    id: string;
    title: string;
    status: string;
    priority_level: string;
    complexity: string;
    tentative_delivery_date: string | null;
    products?: { name: string };
  };
}

export type AllocationInsert = {
  initiative_id: string;
  person_id: string;
  role: 'lead' | 'contributor' | 'reviewer' | 'advisor';
  allocated_hours_per_week: number;
  start_date: string;
  end_date?: string | null;
};

export type AllocationUpdate = Partial<AllocationInsert> & { id: string };

export function useInitiativeAllocations(initiativeId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allocations = [], isLoading, error } = useQuery({
    queryKey: ['initiative-allocations', initiativeId],
    queryFn: async () => {
      let query = supabase
        .from('initiative_allocations')
        .select(`
          *,
          person:people(id, full_name, department, role_title),
          initiative:initiatives(
            id, 
            title, 
            status, 
            priority_level, 
            complexity,
            tentative_delivery_date,
            products(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (initiativeId) {
        query = query.eq('initiative_id', initiativeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as InitiativeAllocation[];
    },
  });

  const createAllocation = useMutation({
    mutationFn: async (allocation: AllocationInsert) => {
      const { data, error } = await supabase
        .from('initiative_allocations')
        .insert(allocation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast({ title: 'Success', description: 'Resource allocation added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateAllocation = useMutation({
    mutationFn: async ({ id, ...updates }: AllocationUpdate) => {
      const { data, error } = await supabase
        .from('initiative_allocations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast({ title: 'Success', description: 'Resource allocation updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAllocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('initiative_allocations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast({ title: 'Success', description: 'Resource allocation removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    allocations,
    isLoading,
    error,
    createAllocation,
    updateAllocation,
    deleteAllocation,
  };
}

// Hook to get all allocations for a person
export function usePersonAllocations(personId?: string) {
  return useQuery({
    queryKey: ['person-allocations', personId],
    enabled: !!personId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiative_allocations')
        .select(`
          *,
          initiative:initiatives(
            id, 
            title, 
            status, 
            priority_level, 
            complexity,
            tentative_delivery_date,
            products(name)
          )
        `)
        .eq('person_id', personId!)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as InitiativeAllocation[];
    },
  });
}
