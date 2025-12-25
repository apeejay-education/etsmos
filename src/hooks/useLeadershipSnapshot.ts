import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

export interface LeadershipSnapshot {
  totalInitiatives: number;
  blockedInitiatives: number;
  overdueContributions: number;
  silentInitiatives: number;
  initiativesByStatus: Record<string, number>;
  initiativesByPriority: Record<string, number>;
}

export function useLeadershipSnapshot() {
  return useQuery({
    queryKey: ['leadership-snapshot'],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Get all active initiatives
      const { data: initiatives, error } = await supabase
        .from('initiatives')
        .select('id, title, status, priority_level, updated_at, tentative_delivery_date')
        .not('status', 'in', '("delivered","dropped")');
      
      if (error) throw error;
      
      const snapshot: LeadershipSnapshot = {
        totalInitiatives: initiatives.length,
        blockedInitiatives: initiatives.filter(i => i.status === 'blocked').length,
        overdueContributions: 0,
        silentInitiatives: 0,
        initiativesByStatus: {},
        initiativesByPriority: {},
      };
      
      // Count by status and priority
      initiatives.forEach(i => {
        snapshot.initiativesByStatus[i.status] = (snapshot.initiativesByStatus[i.status] || 0) + 1;
        snapshot.initiativesByPriority[i.priority_level] = (snapshot.initiativesByPriority[i.priority_level] || 0) + 1;
        
        // Check if silent (no update in 7+ days)
        const lastUpdate = new Date(i.updated_at);
        if (differenceInDays(today, lastUpdate) >= 7) {
          snapshot.silentInitiatives++;
        }
      });
      
      // Get overdue contributions (updates with past due dates still open)
      const { data: overdueUpdates } = await supabase
        .from('initiative_updates')
        .select('id')
        .lt('due_date', today.toISOString().split('T')[0])
        .eq('update_status', 'open');
      
      snapshot.overdueContributions = overdueUpdates?.length || 0;
      
      return snapshot;
    },
  });
}
