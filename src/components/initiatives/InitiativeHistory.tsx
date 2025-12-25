import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History, ArrowRight } from 'lucide-react';

interface InitiativeHistoryProps {
  initiativeId: string;
}

interface AuditEntry {
  id: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_at: string;
  changed_by_name: string | null;
}

export function InitiativeHistory({ initiativeId }: InitiativeHistoryProps) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['initiative-history', initiativeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'initiatives')
        .eq('record_id', initiativeId)
        .order('changed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Get profile info for changed_by users
      const userIds = [...new Set(data.filter(d => d.changed_by).map(d => d.changed_by))];
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds as string[])
        : { data: [] };
      
      const profileMap = new Map<string, string>();
      profiles?.forEach(p => profileMap.set(p.id, p.full_name || p.email || 'Unknown'));
      
      return data.map(entry => ({
        id: entry.id,
        action: entry.action,
        old_data: entry.old_data as Record<string, unknown> | null,
        new_data: entry.new_data as Record<string, unknown> | null,
        changed_at: entry.changed_at,
        changed_by_name: entry.changed_by ? profileMap.get(entry.changed_by) || 'Unknown' : 'System',
      })) as AuditEntry[];
    },
    enabled: !!initiativeId,
  });
  
  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded" />;
  }
  
  const getChangedFields = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData || !newData) return [];
    
    const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];
    const ignoreFields = ['updated_at', 'created_at'];
    
    Object.keys(newData).forEach(key => {
      if (ignoreFields.includes(key)) return;
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({
          field: key.replace(/_/g, ' '),
          oldValue: oldData[key],
          newValue: newData[key],
        });
      }
    });
    
    return changes;
  };
  
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
    return String(value);
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Change History</h4>
      
      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No history recorded
        </p>
      ) : (
        <div className="space-y-3">
          {history.map(entry => {
            const changes = entry.action === 'UPDATE' 
              ? getChangedFields(entry.old_data, entry.new_data)
              : [];
            
            return (
              <Card key={entry.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          entry.action === 'INSERT' ? 'default' :
                          entry.action === 'DELETE' ? 'destructive' : 'outline'
                        }>
                          {entry.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by {entry.changed_by_name}
                        </span>
                      </div>
                      
                      {entry.action === 'UPDATE' && changes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {changes.slice(0, 5).map((change, idx) => (
                            <div key={idx} className="text-sm flex items-center gap-2 flex-wrap">
                              <span className="font-medium capitalize">{change.field}:</span>
                              <span className="text-muted-foreground">{formatValue(change.oldValue)}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span>{formatValue(change.newValue)}</span>
                            </div>
                          ))}
                          {changes.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{changes.length - 5} more changes
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
