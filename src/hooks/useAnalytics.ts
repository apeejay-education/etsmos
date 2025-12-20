import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export interface MonthlyDeliveryData {
  month: string;
  delivered: number;
  approved: number;
}

export interface HealthDistribution {
  status: string;
  count: number;
  fill: string;
}

export interface ContributionStats {
  month: string;
  contributions: number;
  avgRating: number;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const now = new Date();
      const months: MonthlyDeliveryData[] = [];
      
      // Get last 6 months of delivery data
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM');

        // Count delivered initiatives
        const { count: delivered } = await supabase
          .from('initiatives')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'delivered')
          .gte('actual_delivery_date', monthStart.toISOString())
          .lte('actual_delivery_date', monthEnd.toISOString());

        // Count approved initiatives (created this month)
        const { count: approved } = await supabase
          .from('initiatives')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        months.push({
          month: monthLabel,
          delivered: delivered || 0,
          approved: approved || 0
        });
      }

      // Get health status distribution
      const { data: signals } = await supabase
        .from('execution_signals')
        .select('health_status');

      const healthCounts = {
        green: 0,
        amber: 0,
        red: 0
      };

      signals?.forEach(s => {
        if (s.health_status in healthCounts) {
          healthCounts[s.health_status as keyof typeof healthCounts]++;
        }
      });

      const healthDistribution: HealthDistribution[] = [
        { status: 'Green', count: healthCounts.green, fill: 'hsl(142, 76%, 36%)' },
        { status: 'Amber', count: healthCounts.amber, fill: 'hsl(45, 93%, 47%)' },
        { status: 'Red', count: healthCounts.red, fill: 'hsl(0, 84%, 60%)' }
      ];

      // Get contribution stats per month
      const contributionStats: ContributionStats[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM');

        const { data: contributions } = await supabase
          .from('contributions')
          .select('performance_rating')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const ratingValues: Record<string, number> = {
          exceptional: 5,
          exceeds: 4,
          meets: 3,
          developing: 2,
          below: 1
        };

        const ratings = contributions?.filter(c => c.performance_rating)
          .map(c => ratingValues[c.performance_rating as string] || 0) || [];

        contributionStats.push({
          month: monthLabel,
          contributions: contributions?.length || 0,
          avgRating: ratings.length > 0 
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 
            : 0
        });
      }

      return {
        deliveryTrends: months,
        healthDistribution,
        contributionStats
      };
    }
  });
}
