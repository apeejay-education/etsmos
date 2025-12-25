import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UpdateType = 'update' | 'review' | 'closure' | 'comment';
export type UpdateStatus = 'open' | 'completed' | 'blocked';

export interface InitiativeUpdate {
  id: string;
  initiative_id: string;
  person_id: string;
  update_type: UpdateType;
  title: string | null;
  content: string;
  update_status: UpdateStatus | null;
  priority: 'high' | 'medium' | 'low' | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  person?: {
    id: string;
    full_name: string;
  } | null;
}

export function useInitiativeUpdates(initiativeId: string | null, updateType?: UpdateType | UpdateType[]) {
  return useQuery({
    queryKey: ['initiative-updates', initiativeId, updateType],
    queryFn: async () => {
      if (!initiativeId) return [];
      
      let query = supabase
        .from('initiative_updates')
        .select(`
          id,
          initiative_id,
          person_id,
          update_type,
          title,
          content,
          update_status,
          priority,
          due_date,
          created_at,
          updated_at,
          people:person_id (
            id,
            full_name
          )
        `)
        .eq('initiative_id', initiativeId)
        .order('created_at', { ascending: false });
      
      if (updateType) {
        if (Array.isArray(updateType)) {
          query = query.in('update_type', updateType);
        } else {
          query = query.eq('update_type', updateType);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        person: item.people,
      })) as InitiativeUpdate[];
    },
    enabled: !!initiativeId,
  });
}

interface CreateUpdateInput {
  initiative_id: string;
  person_id: string;
  update_type: UpdateType;
  title?: string;
  content: string;
  update_status?: UpdateStatus;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
}

export function useCreateInitiativeUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateUpdateInput) => {
      const { data, error } = await supabase
        .from('initiative_updates')
        .insert({
          initiative_id: input.initiative_id,
          person_id: input.person_id,
          update_type: input.update_type,
          title: input.title || null,
          content: input.content,
          update_status: input.update_status || 'open',
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-updates', variables.initiative_id] });
      toast.success('Update added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add update: ${error.message}`);
    },
  });
}

export function useUpdateInitiativeUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; update_status?: UpdateStatus; content?: string; title?: string }) => {
      const { data, error } = await supabase
        .from('initiative_updates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-updates', data.initiative_id] });
      toast.success('Update modified successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to modify update: ${error.message}`);
    },
  });
}

export function useDeleteInitiativeUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, initiative_id }: { id: string; initiative_id: string }) => {
      const { error } = await supabase
        .from('initiative_updates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, initiative_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['initiative-updates', data.initiative_id] });
      toast.success('Update deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete update: ${error.message}`);
    },
  });
}
