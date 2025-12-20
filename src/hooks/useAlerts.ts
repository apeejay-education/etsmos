import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

export type AlertType = 'aging' | 'blocked' | 'health' | 'silent';
export type AlertSeverity = 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  initiativeId: string;
  initiativeTitle: string;
  createdAt: Date;
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const now = new Date();
      const alerts: Alert[] = [];

      // Get all open initiatives with their signals
      const { data: initiatives } = await supabase
        .from('initiatives')
        .select(`
          id,
          title,
          status,
          approval_date,
          created_at,
          execution_signals(
            health_status,
            last_management_touch
          )
        `)
        .in('status', ['approved', 'in_progress', 'blocked']);

      initiatives?.forEach(initiative => {
        const signal = initiative.execution_signals?.[0];
        const approvalDate = initiative.approval_date || initiative.created_at;
        const daysOld = differenceInDays(now, new Date(approvalDate));

        // Blocked initiatives - critical alert
        if (initiative.status === 'blocked') {
          alerts.push({
            id: `blocked-${initiative.id}`,
            type: 'blocked',
            severity: 'critical',
            title: 'Initiative Blocked',
            description: `This initiative has been marked as blocked and requires attention.`,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
            createdAt: new Date(initiative.created_at)
          });
        }

        // Red/Amber health status
        if (signal?.health_status === 'red') {
          alerts.push({
            id: `health-red-${initiative.id}`,
            type: 'health',
            severity: 'critical',
            title: 'Red Health Status',
            description: `Initiative health is critical and needs immediate attention.`,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
            createdAt: new Date(initiative.created_at)
          });
        } else if (signal?.health_status === 'amber') {
          alerts.push({
            id: `health-amber-${initiative.id}`,
            type: 'health',
            severity: 'warning',
            title: 'Amber Health Status',
            description: `Initiative health is at risk and should be monitored.`,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
            createdAt: new Date(initiative.created_at)
          });
        }

        // Aging initiatives (14+ days)
        if (daysOld > 14 && initiative.status !== 'blocked') {
          alerts.push({
            id: `aging-${initiative.id}`,
            type: 'aging',
            severity: daysOld > 30 ? 'critical' : 'warning',
            title: `Aging Initiative (${daysOld} days)`,
            description: `This initiative has been open for ${daysOld} days without delivery.`,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
            createdAt: new Date(initiative.created_at)
          });
        }

        // Silent initiatives (no management touch in 14+ days)
        if (signal?.last_management_touch) {
          const daysSilent = differenceInDays(now, new Date(signal.last_management_touch));
          if (daysSilent > 14) {
            alerts.push({
              id: `silent-${initiative.id}`,
              type: 'silent',
              severity: daysSilent > 30 ? 'critical' : 'warning',
              title: `Silent Initiative (${daysSilent} days)`,
              description: `No management activity in ${daysSilent} days.`,
              initiativeId: initiative.id,
              initiativeTitle: initiative.title,
              createdAt: new Date(initiative.created_at)
            });
          }
        } else if (signal) {
          // Has signal but no management touch ever
          alerts.push({
            id: `silent-never-${initiative.id}`,
            type: 'silent',
            severity: 'warning',
            title: 'No Management Touch',
            description: `This initiative has never had a management touch recorded.`,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
            createdAt: new Date(initiative.created_at)
          });
        }
      });

      // Sort by severity (critical first) then by date
      alerts.sort((a, b) => {
        if (a.severity !== b.severity) {
          return a.severity === 'critical' ? -1 : 1;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      return alerts;
    }
  });
}
