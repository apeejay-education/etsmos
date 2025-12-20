import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      // Fetch profile info for changed_by users
      const userIds = [...new Set(data.filter(d => d.changed_by).map(d => d.changed_by))];
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
        : { data: [] };

      const profileMap = new Map<string, { id: string; full_name: string | null; email: string | null }>();
      profiles?.forEach(p => profileMap.set(p.id, p));

      return data.map(log => ({
        ...log,
        profiles: log.changed_by ? profileMap.get(log.changed_by) || null : null,
      })) as AuditLog[];
    },
  });
}
