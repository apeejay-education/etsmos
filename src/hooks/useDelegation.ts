import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PersonWorkload {
  id: string;
  fullName: string;
  department: string | null;
  roleTitle: string | null;
  totalInitiatives: number;
  activeInitiatives: number;
  completedInitiatives: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  blockedCount: number;
  overdueCount: number;
  redHealthCount: number;
  amberHealthCount: number;
  workloadScore: number;
  workloadCategory: 'healthy' | 'warning' | 'overloaded';
  initiatives: {
    id: string;
    title: string;
    status: string;
    priority_level: string;
    tentative_delivery_date: string | null;
    health_status: string | null;
    product_name: string | null;
  }[];
}

export function useDelegation() {
  return useQuery({
    queryKey: ['delegation'],
    queryFn: async () => {
      const now = new Date();

      // Get all people with their contributions
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select(`
          id,
          full_name,
          department,
          role_title,
          contributions (
            contribution_role,
            initiative_id,
            initiatives (
              id,
              title,
              status,
              priority_level,
              tentative_delivery_date,
              products (name),
              execution_signals (health_status)
            )
          )
        `)
        .eq('is_active', true)
        .order('full_name');

      if (peopleError) throw peopleError;

      const workloadData: PersonWorkload[] = (people || []).map((person: any) => {
        const contributions = person.contributions || [];
        const initiatives = contributions
          .filter((c: any) => c.initiatives)
          .map((c: any) => ({
            id: c.initiatives.id,
            title: c.initiatives.title,
            status: c.initiatives.status,
            priority_level: c.initiatives.priority_level,
            tentative_delivery_date: c.initiatives.tentative_delivery_date,
            health_status: c.initiatives.execution_signals?.[0]?.health_status || null,
            product_name: c.initiatives.products?.name || null,
            contribution_role: c.contribution_role,
          }));

        // Filter unique initiatives (person might have multiple contribution roles)
        const uniqueInitiatives = initiatives.filter((init: any, index: number, self: any[]) =>
          index === self.findIndex((i) => i.id === init.id)
        );

        const openStatuses = ['approved', 'in_progress', 'blocked'];
        const activeInitiatives = uniqueInitiatives.filter((i: any) => openStatuses.includes(i.status));
        const completedInitiatives = uniqueInitiatives.filter((i: any) => i.status === 'delivered');

        const highPriorityCount = activeInitiatives.filter((i: any) => i.priority_level === 'high').length;
        const mediumPriorityCount = activeInitiatives.filter((i: any) => i.priority_level === 'medium').length;
        const lowPriorityCount = activeInitiatives.filter((i: any) => i.priority_level === 'low').length;
        const blockedCount = activeInitiatives.filter((i: any) => i.status === 'blocked').length;

        // Check overdue: tentative_delivery_date is in the past
        const overdueCount = activeInitiatives.filter((i: any) => {
          if (!i.tentative_delivery_date) return false;
          return new Date(i.tentative_delivery_date) < now;
        }).length;

        const redHealthCount = activeInitiatives.filter((i: any) => i.health_status === 'red').length;
        const amberHealthCount = activeInitiatives.filter((i: any) => i.health_status === 'amber').length;

        // Workload Score Calculation
        const workloadScore =
          (highPriorityCount * 3) +
          (mediumPriorityCount * 2) +
          (lowPriorityCount * 1) +
          (blockedCount * 2) +
          (overdueCount * 2);

        // Categorization
        let workloadCategory: 'healthy' | 'warning' | 'overloaded' = 'healthy';
        if (workloadScore >= 9) {
          workloadCategory = 'overloaded';
        } else if (workloadScore >= 5) {
          workloadCategory = 'warning';
        }

        return {
          id: person.id,
          fullName: person.full_name,
          department: person.department,
          roleTitle: person.role_title,
          totalInitiatives: uniqueInitiatives.length,
          activeInitiatives: activeInitiatives.length,
          completedInitiatives: completedInitiatives.length,
          highPriorityCount,
          mediumPriorityCount,
          lowPriorityCount,
          blockedCount,
          overdueCount,
          redHealthCount,
          amberHealthCount,
          workloadScore,
          workloadCategory,
          initiatives: uniqueInitiatives,
        };
      });

      // Filter to only people with at least one initiative
      const filteredData = workloadData.filter(p => p.totalInitiatives > 0);

      return filteredData;
    },
  });
}
