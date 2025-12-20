import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Person {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  role_title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PersonInsert = Omit<Person, 'id' | 'created_at' | 'updated_at'>;
export type PersonUpdate = Partial<PersonInsert>;

export function usePeople() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: people = [], isLoading, error } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data as Person[];
    },
  });

  const createPerson = useMutation({
    mutationFn: async (person: PersonInsert) => {
      const { data, error } = await supabase
        .from('people')
        .insert(person)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast({ title: 'Success', description: 'Person added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePerson = useMutation({
    mutationFn: async ({ id, ...updates }: PersonUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast({ title: 'Success', description: 'Person updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast({ title: 'Success', description: 'Person deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    people,
    isLoading,
    error,
    createPerson,
    updatePerson,
    deletePerson,
  };
}
