import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { isInitiativeAtRisk, isUpcomingLaunch } from '@/utils/deliveryWindowCalculator';

export interface DashboardStats {
  openInitiatives: number;
  highSensitivityOpen: number;
  blockedInitiatives: number;
  agingInitiatives: number;
  deliveredThisMonth: number;
  redAmberSignals: number;
  silentInitiatives: number;
  upcomingLaunches: number;
  atRiskInitiatives: number;
}

export interface DashboardInitiative {
  id: string;
  title: string;
  status: string;
  priority_level: string;
  sensitivity_level: string;
  approval_date: string | null;
  tentative_delivery_date: string | null;
  created_at: string;
  products: { name: string } | null;
  execution_signals: {
    health_status: string; 
    last_management_touch: string | null;
  }[] | null;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get all initiatives with their signals
      const { data: initiatives, error } = await supabase
        .from('initiatives')
        .select(`
          id,
          title,
          status,
          priority_level,
          sensitivity_level,
          approval_date,
          tentative_delivery_date,
          actual_delivery_date,
          created_at,
          products(name),
          execution_signals(health_status, last_management_touch)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedInitiatives = (initiatives || []) as unknown as DashboardInitiative[];

      // Calculate stats
      const openStatuses = ['approved', 'in_progress', 'blocked'];
      const openInitiatives = typedInitiatives.filter(i => openStatuses.includes(i.status));
      
      const highSensitivityOpen = openInitiatives.filter(
        i => i.sensitivity_level === 'confidential'
      ).length;

      const blockedInitiatives = typedInitiatives.filter(
        i => i.status === 'blocked'
      ).length;

      const agingInitiatives = openInitiatives.filter(i => {
        const date = i.approval_date || i.created_at;
        return differenceInDays(now, new Date(date)) > 14;
      }).length;

      // Delivered this month
      const { data: deliveredData } = await supabase
        .from('initiatives')
        .select('id')
        .eq('status', 'delivered')
        .gte('actual_delivery_date', monthStart.toISOString())
        .lte('actual_delivery_date', monthEnd.toISOString());

      const deliveredThisMonth = deliveredData?.length || 0;

      // Red/Amber signals
      const { data: signalsData } = await supabase
        .from('execution_signals')
        .select('health_status')
        .in('health_status', ['red', 'amber']);

      const redAmberSignals = signalsData?.length || 0;

      // Silent initiatives (no management touch in 14+ days)
      const silentInitiatives = openInitiatives.filter(i => {
        const signal = i.execution_signals?.[0];
        if (!signal?.last_management_touch) return true;
        return differenceInDays(now, new Date(signal.last_management_touch)) > 14;
      }).length;

      // Upcoming launches (in_progress with delivery within 10 business days)
      const upcomingLaunches = typedInitiatives.filter(i => 
        isUpcomingLaunch(i.status, i.tentative_delivery_date)
      ).length;

      // At risk (blocked or approved with delivery within 10 business days)
      const atRiskInitiatives = typedInitiatives.filter(i =>
        isInitiativeAtRisk(i.status, i.tentative_delivery_date)
      ).length;

      // Get the actual upcoming and at-risk initiatives for display
      const upcomingLaunchList = typedInitiatives.filter(i => 
        isUpcomingLaunch(i.status, i.tentative_delivery_date)
      );

      const atRiskList = typedInitiatives.filter(i =>
        isInitiativeAtRisk(i.status, i.tentative_delivery_date)
      );

      const stats: DashboardStats = {
        openInitiatives: openInitiatives.length,
        highSensitivityOpen,
        blockedInitiatives,
        agingInitiatives,
        deliveredThisMonth,
        redAmberSignals,
        silentInitiatives,
        upcomingLaunches,
        atRiskInitiatives
      };

      return {
        stats,
        recentInitiatives: typedInitiatives.slice(0, 10),
        upcomingLaunchList,
        atRiskList
      };
    }
  });
}
