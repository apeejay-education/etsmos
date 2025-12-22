import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useIsInitiativeLead(initiativeId: string | null) {
  return useQuery({
    queryKey: ['is-initiative-lead', initiativeId],
    queryFn: async () => {
      if (!initiativeId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get person for current user
      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!person) return false;

      // Check if this person is a lead on the initiative
      const { data: contribution } = await supabase
        .from('contributions')
        .select('contribution_role')
        .eq('initiative_id', initiativeId)
        .eq('person_id', person.id)
        .eq('contribution_role', 'lead')
        .maybeSingle();
      
      return !!contribution;
    },
    enabled: !!initiativeId
  });
}

export function useCurrentPersonContribution(initiativeId: string | null) {
  return useQuery({
    queryKey: ['current-person-contribution', initiativeId],
    queryFn: async () => {
      if (!initiativeId) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get person for current user
      const { data: person } = await supabase
        .from('people')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!person) return null;

      // Check if this person is tagged in the initiative
      const { data: contribution } = await supabase
        .from('contributions')
        .select('*')
        .eq('initiative_id', initiativeId)
        .eq('person_id', person.id)
        .maybeSingle();
      
      // Return person info even if no contribution (for admins/managers to chat)
      return {
        contribution,
        personId: person.id,
        personName: person.full_name,
        isTagged: !!contribution,
        contributionRole: contribution?.contribution_role || null
      };
    },
    enabled: !!initiativeId
  });
}
