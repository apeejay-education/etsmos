import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCapacitySettings } from './useCapacitySettings';

export interface PersonWorkload {
  id: string;
  fullName: string;
  department: string | null;
  roleTitle: string | null;
  totalAllocatedHours: number;
  effectiveLoad: number;
  utilizationPercentage: number;
  workloadCategory: 'healthy' | 'warning' | 'overloaded';
  activeInitiatives: number;
  completedInitiatives: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  blockedCount: number;
  overdueCount: number;
  redHealthCount: number;
  amberHealthCount: number;
  allocations: {
    id: string;
    initiativeId: string;
    title: string;
    status: string;
    priority_level: string;
    complexity: string;
    role: string;
    allocatedHoursPerWeek: number;
    effectiveLoad: number;
    startDate: string;
    endDate: string | null;
    tentative_delivery_date: string | null;
    health_status: string | null;
    product_name: string | null;
  }[];
}

export function useDelegation() {
  const { settings } = useCapacitySettings();

  return useQuery({
    queryKey: ['delegation', settings?.id],
    enabled: !!settings,
    queryFn: async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Get all allocations with person and initiative data
      const { data: allocations, error: allocationsError } = await supabase
        .from('initiative_allocations')
        .select(`
          *,
          person:people(id, full_name, department, role_title, is_active),
          initiative:initiatives(
            id, 
            title, 
            status, 
            priority_level, 
            complexity,
            tentative_delivery_date,
            products(name),
            execution_signals(health_status)
          )
        `)
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (allocationsError) throw allocationsError;

      // Get all active people for the list (even those without allocations)
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('id, full_name, department, role_title')
        .eq('is_active', true)
        .order('full_name');

      if (peopleError) throw peopleError;

      // Get role and complexity multipliers from settings
      const getRoleMultiplier = (role: string): number => {
        if (!settings) return 1.0;
        switch (role) {
          case 'lead': return settings.role_multiplier_lead;
          case 'contributor': return settings.role_multiplier_contributor;
          case 'reviewer': return settings.role_multiplier_reviewer;
          case 'advisor': return settings.role_multiplier_advisor;
          default: return 1.0;
        }
      };

      const getComplexityMultiplier = (complexity: string): number => {
        if (!settings) return 1.0;
        switch (complexity) {
          case 'low': return settings.complexity_low;
          case 'medium': return settings.complexity_medium;
          case 'high': return settings.complexity_high;
          default: return 1.0;
        }
      };

      const weeklyCapacity = settings?.weekly_capacity_hours || 40;

      // Group allocations by person
      const personAllocationsMap = new Map<string, any[]>();
      
      for (const allocation of allocations || []) {
        if (!allocation.person || !allocation.person.is_active) continue;
        
        const personId = allocation.person.id;
        if (!personAllocationsMap.has(personId)) {
          personAllocationsMap.set(personId, []);
        }
        personAllocationsMap.get(personId)!.push(allocation);
      }

      // Build workload data for each person with allocations
      const workloadData: PersonWorkload[] = [];

      for (const person of people || []) {
        const personAllocations = personAllocationsMap.get(person.id) || [];
        
        // Skip people with no allocations
        if (personAllocations.length === 0) continue;

        let totalAllocatedHours = 0;
        let totalEffectiveLoad = 0;
        let highPriorityCount = 0;
        let mediumPriorityCount = 0;
        let lowPriorityCount = 0;
        let blockedCount = 0;
        let overdueCount = 0;
        let redHealthCount = 0;
        let amberHealthCount = 0;
        let activeInitiatives = 0;
        let completedInitiatives = 0;

        const processedAllocations = personAllocations.map((alloc: any) => {
          const initiative = alloc.initiative;
          const complexity = initiative?.complexity || 'medium';
          const roleMultiplier = getRoleMultiplier(alloc.role);
          const complexityMultiplier = getComplexityMultiplier(complexity);
          const effectiveLoad = alloc.allocated_hours_per_week * roleMultiplier * complexityMultiplier;

          totalAllocatedHours += alloc.allocated_hours_per_week;
          totalEffectiveLoad += effectiveLoad;

          const openStatuses = ['approved', 'in_progress', 'blocked'];
          if (initiative && openStatuses.includes(initiative.status)) {
            activeInitiatives++;
            
            if (initiative.priority_level === 'high') highPriorityCount++;
            if (initiative.priority_level === 'medium') mediumPriorityCount++;
            if (initiative.priority_level === 'low') lowPriorityCount++;
            if (initiative.status === 'blocked') blockedCount++;
            
            if (initiative.tentative_delivery_date && new Date(initiative.tentative_delivery_date) < now) {
              overdueCount++;
            }
            
            const healthStatus = initiative.execution_signals?.[0]?.health_status;
            if (healthStatus === 'red') redHealthCount++;
            if (healthStatus === 'amber') amberHealthCount++;
          } else if (initiative?.status === 'delivered') {
            completedInitiatives++;
          }

          return {
            id: alloc.id,
            initiativeId: initiative?.id || '',
            title: initiative?.title || 'Unknown',
            status: initiative?.status || 'unknown',
            priority_level: initiative?.priority_level || 'medium',
            complexity,
            role: alloc.role,
            allocatedHoursPerWeek: alloc.allocated_hours_per_week,
            effectiveLoad,
            startDate: alloc.start_date,
            endDate: alloc.end_date,
            tentative_delivery_date: initiative?.tentative_delivery_date,
            health_status: initiative?.execution_signals?.[0]?.health_status || null,
            product_name: initiative?.products?.name || null,
          };
        });

        const utilizationPercentage = (totalEffectiveLoad / weeklyCapacity) * 100;
        
        let workloadCategory: 'healthy' | 'warning' | 'overloaded' = 'healthy';
        if (utilizationPercentage > 90) {
          workloadCategory = 'overloaded';
        } else if (utilizationPercentage > 70) {
          workloadCategory = 'warning';
        }

        workloadData.push({
          id: person.id,
          fullName: person.full_name,
          department: person.department,
          roleTitle: person.role_title,
          totalAllocatedHours,
          effectiveLoad: totalEffectiveLoad,
          utilizationPercentage,
          workloadCategory,
          activeInitiatives,
          completedInitiatives,
          highPriorityCount,
          mediumPriorityCount,
          lowPriorityCount,
          blockedCount,
          overdueCount,
          redHealthCount,
          amberHealthCount,
          allocations: processedAllocations,
        });
      }

      return workloadData;
    },
  });
}
