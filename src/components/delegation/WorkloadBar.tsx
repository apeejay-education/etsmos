import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkloadBarProps {
  score: number;
  category: 'healthy' | 'warning' | 'overloaded';
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  blocked: number;
  overdue: number;
}

export function WorkloadBar({
  score,
  category,
  highPriority,
  mediumPriority,
  lowPriority,
  blocked,
  overdue,
}: WorkloadBarProps) {
  const maxScore = 15; // Visual cap for progress bar
  const percentage = Math.min((score / maxScore) * 100, 100);

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">Workload Score: {score}</div>
      <div className="border-t border-border pt-1 space-y-0.5">
        <div>High Priority × 3: {highPriority} × 3 = {highPriority * 3}</div>
        <div>Medium Priority × 2: {mediumPriority} × 2 = {mediumPriority * 2}</div>
        <div>Low Priority × 1: {lowPriority} × 1 = {lowPriority}</div>
        <div>Blocked × 2: {blocked} × 2 = {blocked * 2}</div>
        <div>Overdue × 2: {overdue} × 2 = {overdue * 2}</div>
      </div>
      <div className="border-t border-border pt-1">
        <span className="font-medium">Category: </span>
        <span className={cn(
          category === 'healthy' && 'text-green-500',
          category === 'warning' && 'text-yellow-500',
          category === 'overloaded' && 'text-destructive'
        )}>
          {category === 'healthy' && 'Healthy (0-4)'}
          {category === 'warning' && 'Warning (5-8)'}
          {category === 'overloaded' && 'Overloaded (9+)'}
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
            'text-sm font-medium min-w-[2rem]',
            category === 'healthy' && 'text-green-600',
            category === 'warning' && 'text-yellow-600',
            category === 'overloaded' && 'text-destructive'
          )}>
            {score}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
