import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ChatMessage {
  id: string;
  initiative_id: string;
  person_id: string;
  message: string;
  created_at: string;
  people?: {
    full_name: string;
  };
}

export function useInitiativeChat(initiativeId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['initiative-chat', initiativeId],
    queryFn: async () => {
      if (!initiativeId) return [];
      
      const { data, error } = await supabase
        .from('initiative_chats')
        .select('*, people(full_name)')
        .eq('initiative_id', initiativeId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!initiativeId
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!initiativeId) return;

    const channel = supabase
      .channel(`initiative-chat-${initiativeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'initiative_chats',
          filter: `initiative_id=eq.${initiativeId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['initiative-chat', initiativeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initiativeId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ message, personId }: { message: string; personId: string }) => {
      if (!initiativeId) throw new Error('No initiative selected');
      
      const { data, error } = await supabase
        .from('initiative_chats')
        .insert({
          initiative_id: initiativeId,
          person_id: personId,
          message
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-chat', initiativeId] });
    }
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('initiative_chats')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-chat', initiativeId] });
    }
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    sendMessage,
    deleteMessage
  };
}

export function useUserContribution(initiativeId: string | null) {
  return useQuery({
    queryKey: ['user-contribution', initiativeId],
    queryFn: async () => {
      if (!initiativeId) return null;
      
      // Get current user's person_id first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!person) return null;

      // Check if user is tagged in this initiative
      const { data: contribution } = await supabase
        .from('contributions')
        .select('*, people(full_name)')
        .eq('initiative_id', initiativeId)
        .eq('person_id', person.id)
        .maybeSingle();
      
      return contribution ? { ...contribution, personId: person.id } : null;
    },
    enabled: !!initiativeId
  });
}
