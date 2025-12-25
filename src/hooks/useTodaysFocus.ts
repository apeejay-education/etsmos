import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, addDays } from 'date-fns';

export interface FocusItem {
  id: string;
  title: string;
  type: 'overdue_soon' | 'blocked_long' | 'new_high_priority' | 'silent';
  urgency: 'high' | 'medium' | 'low';
  description: string;
  product_name: string | null;
  days: number;
}

export function useTodaysFocus() {
  return useQuery({
    queryKey: ['todays-focus'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysFromNow = addDays(now, 7);
      const sevenDaysAgo = addDays(now, -7);

      const { data: initiatives, error } = await supabase
        .from('initiatives')
        .select(`
          id,
          title,
          status,
          priority_level,
          tentative_delivery_date,
          created_at,
          updated_at,
          products (name),
          execution_signals (health_status, last_management_touch, updated_at)
        `)
        .in('status', ['approved', 'in_progress', 'blocked']);

      if (error) throw error;

      const focusItems: FocusItem[] = [];

      (initiatives || []).forEach((initiative: any) => {
        const signal = initiative.execution_signals?.[0];
        const productName = initiative.products?.name || null;

        // 1. Overdue Soon: Due within 7 days
        if (initiative.tentative_delivery_date) {
          const dueDate = new Date(initiative.tentative_delivery_date);
          const daysUntilDue = differenceInDays(dueDate, now);
          
          if (daysUntilDue >= 0 && daysUntilDue <= 7) {
            focusItems.push({
              id: initiative.id,
              title: initiative.title,
              type: 'overdue_soon',
              urgency: daysUntilDue <= 2 ? 'high' : daysUntilDue <= 5 ? 'medium' : 'low',
              description: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              product_name: productName,
              days: daysUntilDue,
            });
          }
        }

        // 2. Blocked Long: Blocked for more than 3 days
        if (initiative.status === 'blocked') {
          const blockedSince = signal?.updated_at || initiative.updated_at;
          const daysSinceBlocked = differenceInDays(now, new Date(blockedSince));
          
          if (daysSinceBlocked > 3) {
            focusItems.push({
              id: initiative.id,
              title: initiative.title,
              type: 'blocked_long',
              urgency: daysSinceBlocked > 7 ? 'high' : 'medium',
              description: `Blocked for ${daysSinceBlocked} days`,
              product_name: productName,
              days: daysSinceBlocked,
            });
          }
        }

        // 3. New High Priority: Added in last 7 days
        if (initiative.priority_level === 'high') {
          const createdDate = new Date(initiative.created_at);
          const daysSinceCreated = differenceInDays(now, createdDate);
          
          if (daysSinceCreated <= 7 && daysSinceCreated >= 0) {
            focusItems.push({
              id: initiative.id,
              title: initiative.title,
              type: 'new_high_priority',
              urgency: 'high',
              description: `New high-priority item (${daysSinceCreated} day${daysSinceCreated === 1 ? '' : 's'} ago)`,
              product_name: productName,
              days: daysSinceCreated,
            });
          }
        }

        // 4. Silent Initiatives: No update in 14+ days
        const lastTouch = signal?.last_management_touch || signal?.updated_at || initiative.updated_at;
        const daysSinceUpdate = differenceInDays(now, new Date(lastTouch));
        
        if (daysSinceUpdate >= 14 && initiative.status !== 'blocked') {
          focusItems.push({
            id: initiative.id,
            title: initiative.title,
            type: 'silent',
            urgency: daysSinceUpdate > 21 ? 'high' : 'medium',
            description: `No activity for ${daysSinceUpdate} days`,
            product_name: productName,
            days: daysSinceUpdate,
          });
        }
      });

      // Sort by urgency (high first), then by days
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      focusItems.sort((a, b) => {
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.days - b.days;
      });

      // Remove duplicates (same initiative might appear in multiple categories)
      const uniqueItems = focusItems.filter((item, index, self) =>
        index === self.findIndex((i) => i.id === item.id && i.type === item.type)
      );

      return uniqueItems;
    },
  });
}
