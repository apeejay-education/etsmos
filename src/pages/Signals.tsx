import { useState } from 'react';
import { useExecutionSignals, useCreateExecutionSignal, useUpdateExecutionSignal } from '@/hooks/useExecutionSignals';
import { useInitiatives } from '@/hooks/useInitiatives';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { ExecutionSignalDialog } from '@/components/signals/ExecutionSignalDialog';
import { ExecutionSignal, HealthStatus, ExecutionStage } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

export default function Signals() {
  const { data: signals, isLoading } = useExecutionSignals();
  const { data: initiatives } = useInitiatives();
  const { canEdit } = useAuth();
  const createSignal = useCreateExecutionSignal();
  const updateSignal = useUpdateExecutionSignal();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<ExecutionSignal | null>(null);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);

  // Get initiatives without signals
  const initiativesWithoutSignals = initiatives?.filter(
    i => !signals?.find(s => s.initiative_id === i.id) &&
    i.status !== 'delivered' && i.status !== 'dropped'
  ) || [];

  const handleCreate = (data: Omit<ExecutionSignal, 'id' | 'created_at' | 'updated_at' | 'initiatives'>) => {
    createSignal.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectedInitiativeId(null);
      }
    });
  };

  const handleUpdate = (data: Omit<ExecutionSignal, 'id' | 'created_at' | 'updated_at' | 'initiatives'>) => {
    if (!editingSignal) return;
    updateSignal.mutate({ id: editingSignal.id, ...data }, {
      onSuccess: () => {
        setEditingSignal(null);
        setDialogOpen(false);
      }
    });
  };

  const healthColors: Record<HealthStatus, string> = {
    green: 'bg-green-100 text-green-800 border-green-300',
    amber: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  const stageLabels: Record<ExecutionStage, string> = {
    not_started: 'Not Started',
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed'
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Execution Signals</h1>
            <p className="text-muted-foreground">
              Monitor execution health across initiatives
            </p>
          </div>
        </div>

        {initiativesWithoutSignals.length > 0 && canEdit && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Initiatives Missing Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {initiativesWithoutSignals.map((initiative) => (
                  <Button
                    key={initiative.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInitiativeId(initiative.id);
                      setEditingSignal(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {initiative.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {signals?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No execution signals yet. Add signals to track initiative health.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {signals?.map((signal) => (
              <Card 
                key={signal.id} 
                className={`border-l-4 ${
                  signal.health_status === 'red' ? 'border-l-red-500' :
                  signal.health_status === 'amber' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {signal.initiatives?.title}
                        </h3>
                        <Badge className={healthColors[signal.health_status]}>
                          {signal.health_status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signal.initiatives?.products?.name}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">
                          {stageLabels[signal.execution_stage]}
                        </Badge>
                        {signal.initiatives?.priority_level && (
                          <Badge variant={
                            signal.initiatives.priority_level === 'high' ? 'destructive' : 'secondary'
                          }>
                            {signal.initiatives.priority_level} priority
                          </Badge>
                        )}
                      </div>

                      {signal.risk_blocker_summary && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Risks / Blockers</p>
                          <p className="text-sm text-muted-foreground">
                            {signal.risk_blocker_summary}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        {signal.last_management_touch && (
                          <span>
                            Last touch: {formatDistanceToNow(new Date(signal.last_management_touch))} ago
                          </span>
                        )}
                        {signal.next_expected_movement && (
                          <span>
                            Next movement: {new Date(signal.next_expected_movement).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingSignal(signal); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ExecutionSignalDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedInitiativeId(null);
              setEditingSignal(null);
            }
          }}
          signal={editingSignal}
          initiativeId={selectedInitiativeId || editingSignal?.initiative_id}
          initiatives={initiativesWithoutSignals}
          onSubmit={editingSignal ? handleUpdate : handleCreate}
          isLoading={createSignal.isPending || updateSignal.isPending}
        />
      </div>
    </AppLayout>
  );
}
