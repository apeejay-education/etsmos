import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkloadBarProps {
  utilizationPercentage: number;
  effectiveLoad: number;
  category: 'healthy' | 'warning' | 'overloaded';
  totalHours: number;
}

export function WorkloadBar({
  utilizationPercentage,
  effectiveLoad,
  category,
  totalHours,
}: WorkloadBarProps) {
  const percentage = Math.min(utilizationPercentage, 100);
  const displayPercentage = Math.round(utilizationPercentage);

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">Utilization: {displayPercentage}%</div>
      <div className="border-t border-border pt-1 space-y-0.5">
        <div>Total Allocated Hours: {totalHours}h/week</div>
        <div>Effective Load: {effectiveLoad.toFixed(1)}h (with multipliers)</div>
      </div>
      <div className="border-t border-border pt-1">
        <span className="font-medium">Status: </span>
        <span className={cn(
          category === 'healthy' && 'text-green-500',
          category === 'warning' && 'text-yellow-500',
          category === 'overloaded' && 'text-destructive'
        )}>
          {category === 'healthy' && 'Healthy (0-70%)'}
          {category === 'warning' && 'Warning (71-90%)'}
          {category === 'overloaded' && 'Overloaded (91%+)'}
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                category === 'healthy' && 'bg-green-500',
                category === 'warning' && 'bg-yellow-500',
                category === 'overloaded' && 'bg-destructive'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={cn(
            'text-sm font-medium min-w-[3rem]',
            category === 'healthy' && 'text-green-600',
            category === 'warning' && 'text-yellow-600',
            category === 'overloaded' && 'text-destructive'
          )}>
            {displayPercentage}%
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
