import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ContributionRole = 'lead' | 'contributor' | 'reviewer' | 'advisor';
export type PerformanceRating = 'exceptional' | 'strong' | 'meets_expectations' | 'needs_improvement';

export interface Contribution {
  id: string;
  person_id: string;
  initiative_id: string;
  contribution_role: ContributionRole;
  contribution_summary: string | null;
  performance_rating: PerformanceRating | null;
  assessment_notes: string | null;
  assessed_by: string | null;
  assessed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  people?: {
    id: string;
    full_name: string;
    department: string | null;
    role_title: string | null;
  };
  initiatives?: {
    id: string;
    title: string;
    status: string;
  };
}

export type ContributionInsert = Omit<Contribution, 'id' | 'created_at' | 'updated_at' | 'people' | 'initiatives'>;
export type ContributionUpdate = Partial<ContributionInsert>;

export function useContributions(initiativeId?: string, personId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contributions = [], isLoading, error } = useQuery({
    queryKey: ['contributions', initiativeId, personId],
    queryFn: async () => {
      let query = supabase
        .from('contributions')
        .select(`
          *,
          people (id, full_name, department, role_title),
          initiatives (id, title, status)
        `)
        .order('created_at', { ascending: false });
      
      if (initiativeId) {
        query = query.eq('initiative_id', initiativeId);
      }
      if (personId) {
        query = query.eq('person_id', personId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Contribution[];
    },
  });

  const createContribution = useMutation({
    mutationFn: async (contribution: ContributionInsert) => {
      const { data, error } = await supabase
        .from('contributions')
        .insert(contribution)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      toast({ title: 'Success', description: 'Contribution added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateContribution = useMutation({
    mutationFn: async ({ id, ...updates }: ContributionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contributions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      toast({ title: 'Success', description: 'Contribution updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteContribution = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      toast({ title: 'Success', description: 'Contribution deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    contributions,
    isLoading,
    error,
    createContribution,
    updateContribution,
    deleteContribution,
  };
}
