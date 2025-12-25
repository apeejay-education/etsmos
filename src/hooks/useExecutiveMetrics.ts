import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';

export interface ExecutiveMetrics {
  portfolio: {
    total: number;
    onTrack: number;
    atRisk: number;
    delayed: number;
    onTrackPercent: number;
    atRiskPercent: number;
    delayedPercent: number;
  };
  byProduct: {
    name: string;
    count: number;
    atRisk: number;
  }[];
  byDepartment: {
    name: string;
    count: number;
  }[];
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  decisionQueue: {
    blockedLong: number;
    needsAttention: number;
    awaitingApproval: number;
  };
  trends: {
    thisMonthDelivered: number;
    lastMonthDelivered: number;
    riskTrend: 'improving' | 'stable' | 'degrading';
  };
}

export function useExecutiveMetrics() {
  return useQuery({
    queryKey: ['executive-metrics'],
    queryFn: async () => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Get all initiatives with related data
      const { data: initiatives, error } = await supabase
        .from('initiatives')
        .select(`
          id,
          title,
          status,
          priority_level,
          tentative_delivery_date,
          actual_delivery_date,
          created_at,
          products (id, name),
          execution_signals (health_status, created_at)
        `);

      if (error) throw error;

      // Get people for department breakdown
      const { data: people } = await supabase
        .from('people')
        .select(`
          id,
          department,
          contributions (initiative_id)
        `)
        .eq('is_active', true);

      const openStatuses = ['approved', 'in_progress', 'blocked'];
      const openInitiatives = (initiatives || []).filter((i: any) => openStatuses.includes(i.status));

      // Portfolio summary
      const onTrack = openInitiatives.filter((i: any) => {
        const health = i.execution_signals?.[0]?.health_status;
        return health === 'green' || !health;
      }).length;

      const atRisk = openInitiatives.filter((i: any) => {
        const health = i.execution_signals?.[0]?.health_status;
        return health === 'amber' || health === 'red';
      }).length;

      const delayed = openInitiatives.filter((i: any) => {
        if (!i.tentative_delivery_date) return false;
        return new Date(i.tentative_delivery_date) < now;
      }).length;

      const total = openInitiatives.length;

      // By Product breakdown
      const productMap = new Map<string, { count: number; atRisk: number }>();
      openInitiatives.forEach((i: any) => {
        const productName = i.products?.name || 'Unassigned';
        const current = productMap.get(productName) || { count: 0, atRisk: 0 };
        current.count++;
        const health = i.execution_signals?.[0]?.health_status;
        if (health === 'amber' || health === 'red') {
          current.atRisk++;
        }
        productMap.set(productName, current);
      });

      const byProduct = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      // By Department breakdown
      const departmentMap = new Map<string, Set<string>>();
      (people || []).forEach((person: any) => {
        const dept = person.department || 'Unassigned';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, new Set());
        }
        (person.contributions || []).forEach((c: any) => {
          if (openInitiatives.find((i: any) => i.id === c.initiative_id)) {
            departmentMap.get(dept)!.add(c.initiative_id);
          }
        });
      });

      const byDepartment = Array.from(departmentMap.entries())
        .map(([name, ids]) => ({ name, count: ids.size }))
        .filter(d => d.count > 0)
        .sort((a, b) => b.count - a.count);

      // By Priority
      const byPriority = {
        high: openInitiatives.filter((i: any) => i.priority_level === 'high').length,
        medium: openInitiatives.filter((i: any) => i.priority_level === 'medium').length,
        low: openInitiatives.filter((i: any) => i.priority_level === 'low').length,
      };

      // Decision Queue
      const blockedLong = openInitiatives.filter((i: any) => {
        if (i.status !== 'blocked') return false;
        const signalDate = i.execution_signals?.[0]?.created_at;
        if (!signalDate) return differenceInDays(now, new Date(i.created_at)) > 3;
        return differenceInDays(now, new Date(signalDate)) > 3;
      }).length;

      const needsAttention = openInitiatives.filter((i: any) => {
        const health = i.execution_signals?.[0]?.health_status;
        return i.priority_level === 'high' && (health === 'red' || health === 'amber');
      }).length;

      const awaitingApproval = openInitiatives.filter((i: any) => i.status === 'approved').length;

      // Trends
      const thisMonthDelivered = (initiatives || []).filter((i: any) => {
        if (i.status !== 'delivered' || !i.actual_delivery_date) return false;
        const date = new Date(i.actual_delivery_date);
        return date >= thisMonthStart && date <= thisMonthEnd;
      }).length;

      const lastMonthDelivered = (initiatives || []).filter((i: any) => {
        if (i.status !== 'delivered' || !i.actual_delivery_date) return false;
        const date = new Date(i.actual_delivery_date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }).length;

      // Simple risk trend calculation based on current vs historical at-risk ratio
      const atRiskRatio = total > 0 ? atRisk / total : 0;
      let riskTrend: 'improving' | 'stable' | 'degrading' = 'stable';
      if (atRiskRatio > 0.3) {
        riskTrend = 'degrading';
      } else if (atRiskRatio < 0.1) {
        riskTrend = 'improving';
      }

      const metrics: ExecutiveMetrics = {
        portfolio: {
          total,
          onTrack,
          atRisk,
          delayed,
          onTrackPercent: total > 0 ? Math.round((onTrack / total) * 100) : 0,
          atRiskPercent: total > 0 ? Math.round((atRisk / total) * 100) : 0,
          delayedPercent: total > 0 ? Math.round((delayed / total) * 100) : 0,
        },
        byProduct,
        byDepartment,
        byPriority,
        decisionQueue: {
          blockedLong,
          needsAttention,
          awaitingApproval,
        },
        trends: {
          thisMonthDelivered,
          lastMonthDelivered,
          riskTrend,
        },
      };

      return metrics;
    },
  });
}
