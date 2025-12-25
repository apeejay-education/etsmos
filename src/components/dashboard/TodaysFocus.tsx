import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Zap, EyeOff } from 'lucide-react';
import { useTodaysFocus, type FocusItem } from '@/hooks/useTodaysFocus';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const typeConfig = {
  overdue_soon: {
    label: 'Due Soon',
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
  },
  blocked_long: {
    label: 'Blocked',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/30',
  },
  new_high_priority: {
    label: 'New Priority',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
  },
  silent: {
    label: 'Silent',
    icon: EyeOff,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted-foreground/30',
  },
};

export function TodaysFocus() {
  const { data: items, isLoading } = useTodaysFocus();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-medium">All clear!</p>
            <p className="text-sm">No items require immediate attention today.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group items by type for better organization
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, FocusItem[]>);

  const typeOrder: (keyof typeof typeConfig)[] = ['blocked_long', 'overdue_soon', 'new_high_priority', 'silent'];

  return (
    <div className="space-y-4">
      {typeOrder.map(type => {
        const typeItems = groupedItems[type];
        if (!typeItems?.length) return null;

        const config = typeConfig[type];
        const Icon = config.icon;

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={cn('h-4 w-4', config.color)} />
                {config.label}
                <Badge variant="secondary" className="ml-auto">
                  {typeItems.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeItems.slice(0, 5).map(item => (
                  <div
                    key={`${item.id}-${item.type}`}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity',
                      config.bgColor
                    )}
                    onClick={() => navigate(`/initiatives?search=${encodeURIComponent(item.title)}`)}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.product_name || 'No product'} • {item.description}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        item.urgency === 'high' ? 'destructive' :
                        item.urgency === 'medium' ? 'default' : 'secondary'
                      }
                      className="ml-2 shrink-0"
                    >
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
                {typeItems.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{typeItems.length - 5} more
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
