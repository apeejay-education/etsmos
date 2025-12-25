import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReviewQueueItem {
  id: string;
  initiative_id: string;
  initiative_title: string;
  product_name: string;
  status: string;
  priority_level: string;
  contribution_role: string;
  pending_updates_count: number;
}

export function useReviewQueue() {
  return useQuery({
    queryKey: ['review-queue'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get person for current user
      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!person) return [];
      
      // Get initiatives where user is a reviewer
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select(`
          id,
          contribution_role,
          initiatives (
            id,
            title,
            status,
            priority_level,
            products (name)
          )
        `)
        .eq('person_id', person.id)
        .eq('contribution_role', 'reviewer');
      
      if (error) throw error;
      
      const initiativeIds = contributions
        .map(c => (c.initiatives as any)?.id)
        .filter(Boolean);
      
      if (initiativeIds.length === 0) return [];
      
      // Get pending updates for these initiatives (updates that need review)
      const { data: updates } = await supabase
        .from('initiative_updates')
        .select('initiative_id, update_type, update_status')
        .in('initiative_id', initiativeIds)
        .eq('update_type', 'update')
        .eq('update_status', 'open');
      
      const updateCounts = new Map<string, number>();
      updates?.forEach(u => {
        updateCounts.set(u.initiative_id, (updateCounts.get(u.initiative_id) || 0) + 1);
      });
      
      return contributions
        .map(c => {
          const init = c.initiatives as any;
          if (!init || init.status === 'delivered' || init.status === 'dropped') return null;
          
          return {
            id: c.id,
            initiative_id: init.id,
            initiative_title: init.title,
            product_name: init.products?.name || 'Unknown',
            status: init.status,
            priority_level: init.priority_level,
            contribution_role: c.contribution_role,
            pending_updates_count: updateCounts.get(init.id) || 0,
          } as ReviewQueueItem;
        })
        .filter((item): item is ReviewQueueItem => item !== null)
        .sort((a, b) => b.pending_updates_count - a.pending_updates_count);
    },
  });
}
