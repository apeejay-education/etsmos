import { Initiative, InitiativeStatus, PriorityLevel, SensitivityLevel } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InitiativeKanbanProps {
  initiatives: Initiative[];
  onEdit?: (initiative: Initiative) => void;
  onDelete?: (id: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
}

const statusOrder: InitiativeStatus[] = ['approved', 'in_progress', 'blocked', 'delivered', 'dropped'];

const statusLabels: Record<InitiativeStatus, string> = {
  approved: 'Approved',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  delivered: 'Delivered',
  dropped: 'Dropped'
};

const statusColors: Record<InitiativeStatus, string> = {
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  blocked: 'bg-red-100 text-red-800',
  delivered: 'bg-green-100 text-green-800',
  dropped: 'bg-gray-100 text-gray-800'
};

const priorityColors: Record<PriorityLevel, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800'
};

const sensitivityColors: Record<SensitivityLevel, string> = {
  confidential: 'bg-purple-100 text-purple-800',
  internal: 'bg-blue-100 text-blue-800',
  routine: 'bg-gray-100 text-gray-800'
};

const columnColors: Record<InitiativeStatus, string> = {
  approved: 'border-t-blue-500',
  in_progress: 'border-t-yellow-500',
  blocked: 'border-t-red-500',
  delivered: 'border-t-green-500',
  dropped: 'border-t-gray-500'
};

export function InitiativeKanban({ initiatives, onEdit, onDelete, canEdit, isAdmin }: InitiativeKanbanProps) {
  const groupedInitiatives = statusOrder.reduce((acc, status) => {
    acc[status] = initiatives.filter(i => i.status === status);
    return acc;
  }, {} as Record<InitiativeStatus, Initiative[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statusOrder.map(status => (
        <div key={status} className={`bg-muted/30 rounded-lg p-3 border-t-4 ${columnColors[status]}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{statusLabels[status]}</h3>
            <Badge variant="secondary" className="text-xs">
              {groupedInitiatives[status].length}
            </Badge>
          </div>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-3 pr-2">
              {groupedInitiatives[status].map(initiative => {
                const aging = differenceInDays(
                  new Date(),
                  new Date(initiative.approval_date || initiative.created_at)
                );

                return (
                  <Card key={initiative.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-medium text-sm line-clamp-2">{initiative.title}</h4>
                          {canEdit && (
                            <div className="flex gap-0.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onEdit?.(initiative)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onDelete?.(initiative.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {initiative.products?.name}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className={`${priorityColors[initiative.priority_level]} text-xs`}>
                            {initiative.priority_level}
                          </Badge>
                          <Badge className={`${sensitivityColors[initiative.sensitivity_level]} text-xs`}>
                            {initiative.sensitivity_level}
                          </Badge>
                          {aging > 14 && status !== 'delivered' && status !== 'dropped' && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                              {aging}d
                            </Badge>
                          )}
                        </div>
                        {initiative.accountable_owner && (
                          <p className="text-xs text-muted-foreground truncate">
                            {initiative.accountable_owner}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {groupedInitiatives[status].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No initiatives
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
