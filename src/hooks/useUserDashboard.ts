import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserInitiative {
  id: string;
  title: string;
  status: string;
  priority_level: string;
  tentative_delivery_date: string | null;
  actual_delivery_date: string | null;
  product_name: string;
  health_status: string | null;
  contribution_role: string;
}

export interface UserContribution {
  id: string;
  initiative_id: string;
  initiative_title: string;
  contribution_role: string;
  contribution_summary: string | null;
  performance_rating: string | null;
  assessment_notes: string | null;
  assessed_at: string | null;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  tentative_delivery_date: string;
  status: string;
  priority_level: string;
}

export function useUserDashboard() {
  const { user, userRole } = useAuth();
  const isViewer = userRole === 'viewer';

  // Get current user's person_id
  const { data: personData } = useQuery({
    queryKey: ['current-person', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('people')
        .select('id, must_reset_password')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get user's initiatives with details
  const { data: userInitiatives = [], isLoading: loadingInitiatives } = useQuery({
    queryKey: ['user-initiatives', personData?.id],
    queryFn: async () => {
      if (!personData?.id) return [];
      
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          contribution_role,
          initiatives (
            id,
            title,
            status,
            priority_level,
            tentative_delivery_date,
            actual_delivery_date,
            products (name)
          )
        `)
        .eq('person_id', personData.id);
      
      if (error) throw error;

      // Get execution signals for these initiatives
      const initiativeIds = data
        .map(c => (c.initiatives as any)?.id)
        .filter(Boolean);
      
      const { data: signals } = await supabase
        .from('execution_signals')
        .select('initiative_id, health_status')
        .in('initiative_id', initiativeIds);

      const signalMap = new Map(signals?.map(s => [s.initiative_id, s.health_status]) || []);

      return data.map(c => {
        const init = c.initiatives as any;
        return {
          id: init?.id,
          title: init?.title,
          status: init?.status,
          priority_level: init?.priority_level,
          tentative_delivery_date: init?.tentative_delivery_date,
          actual_delivery_date: init?.actual_delivery_date,
          product_name: init?.products?.name,
          health_status: signalMap.get(init?.id) || null,
          contribution_role: c.contribution_role,
        } as UserInitiative;
      }).filter(i => i.id);
    },
    enabled: !!personData?.id && isViewer,
  });

  // Get user's contributions
  const { data: userContributions = [], isLoading: loadingContributions } = useQuery({
    queryKey: ['user-contributions', personData?.id],
    queryFn: async () => {
      if (!personData?.id) return [];
      
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          id,
          initiative_id,
          contribution_role,
          contribution_summary,
          performance_rating,
          assessment_notes,
          assessed_at,
          initiatives (title)
        `)
        .eq('person_id', personData.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      return data.map(c => ({
        id: c.id,
        initiative_id: c.initiative_id,
        initiative_title: (c.initiatives as any)?.title,
        contribution_role: c.contribution_role,
        contribution_summary: c.contribution_summary,
        performance_rating: c.performance_rating,
        assessment_notes: c.assessment_notes,
        assessed_at: c.assessed_at,
      })) as UserContribution[];
    },
    enabled: !!personData?.id && isViewer,
  });

  // Get upcoming deadlines
  const { data: upcomingDeadlines = [], isLoading: loadingDeadlines } = useQuery({
    queryKey: ['user-deadlines', personData?.id],
    queryFn: async () => {
      if (!personData?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          initiatives (
            id,
            title,
            tentative_delivery_date,
            status,
            priority_level
          )
        `)
        .eq('person_id', personData.id);
      
      if (error) throw error;

      const deadlines = data
        .map(c => (c.initiatives as any))
        .filter(i => i?.tentative_delivery_date && i.tentative_delivery_date >= today && i.status !== 'delivered' && i.status !== 'dropped')
        .map(i => ({
          id: i.id,
          title: i.title,
          tentative_delivery_date: i.tentative_delivery_date,
          status: i.status,
          priority_level: i.priority_level,
        }))
        .sort((a, b) => a.tentative_delivery_date.localeCompare(b.tentative_delivery_date));

      // Remove duplicates
      const seen = new Set();
      return deadlines.filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      }) as UpcomingDeadline[];
    },
    enabled: !!personData?.id && isViewer,
  });

  return {
    personId: personData?.id,
    mustResetPassword: personData?.must_reset_password ?? false,
    userInitiatives,
    userContributions,
    upcomingDeadlines,
    isLoading: loadingInitiatives || loadingContributions || loadingDeadlines,
    isViewer,
  };
}