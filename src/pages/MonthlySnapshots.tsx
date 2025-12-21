import { useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Plus, Pencil, Trash2, Calendar, ChevronDown, ChevronRight, CheckCircle2, Rocket, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useMonthlySnapshots, MonthlySnapshot } from '@/hooks/useMonthlySnapshots';
import { SnapshotDialog } from '@/components/snapshots/SnapshotDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useInitiatives } from '@/hooks/useInitiatives';

interface MiniCardProps {
  icon: React.ReactNode;
  title: string;
  content: string | null;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

function MiniCard({ icon, title, content, variant = 'default' }: MiniCardProps) {
  if (!content) return null;
  
  const variantStyles = {
    default: 'border-border bg-card',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export default function MonthlySnapshots() {
  const { snapshots, isLoading, deleteSnapshot } = useMonthlySnapshots();
  const { data: initiatives = [] } = useInitiatives();
  const { userRole } = useAuth();
  const canEdit = userRole === 'admin' || userRole === 'manager';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<MonthlySnapshot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getMonthlyInitiatives = (monthYear: string) => {
    const monthDate = parseISO(monthYear);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const delivered = initiatives.filter(i => {
      if (i.status !== 'delivered' || !i.actual_delivery_date) return false;
      const deliveryDate = parseISO(i.actual_delivery_date);
      return deliveryDate >= monthStart && deliveryDate <= monthEnd;
    });

    const approved = initiatives.filter(i => {
      if (!i.approval_date) return false;
      const approvalDate = parseISO(i.approval_date);
      return approvalDate >= monthStart && approvalDate <= monthEnd;
    });

    return { delivered, approved };
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (snapshot: MonthlySnapshot) => {
    setSelectedSnapshot(snapshot);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedSnapshot(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSnapshot.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monthly Snapshots</h1>
            <p className="text-muted-foreground">Capture monthly delivery summaries and learnings</p>
          </div>
          {canEdit && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Snapshot
            </Button>
          )}
        </div>

        {snapshots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No monthly snapshots yet</p>
              {canEdit && (
                <Button onClick={handleCreate} className="mt-4">
                  Create First Snapshot
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {snapshots.map((snapshot) => {
              const isExpanded = expandedIds.has(snapshot.id);
              const { delivered, approved } = getMonthlyInitiatives(snapshot.month_year);
              
              return (
                <Card key={snapshot.id} className="overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(snapshot.id)}>
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger className="flex items-center gap-3 hover:opacity-80">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <CardTitle className="text-xl">
                            {format(new Date(snapshot.month_year), 'MMMM yyyy')}
                          </CardTitle>
                          <div className="flex gap-2 ml-4">
                            {delivered.length > 0 && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {delivered.length} Delivered
                              </Badge>
                            )}
                            {approved.length > 0 && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                <Rocket className="h-3 w-3 mr-1" />
                                {approved.length} Approved
                              </Badge>
                            )}
                          </div>
                        </CollapsibleTrigger>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(snapshot)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(snapshot.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {snapshot.summary && (
                        <p className="text-muted-foreground text-sm mt-3 ml-8">{snapshot.summary}</p>
                      )}
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-6">
                        {/* Initiative Lists */}
                        {(delivered.length > 0 || approved.length > 0) && (
                          <div className="grid gap-4 md:grid-cols-2 mb-6">
                            {delivered.length > 0 && (
                              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <h4 className="font-semibold text-sm">Delivered This Month</h4>
                                </div>
                                <ul className="space-y-1">
                                  {delivered.map(i => (
                                    <li key={i.id} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-green-600 mt-1">•</span>
                                      {i.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {approved.length > 0 && (
                              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Rocket className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-sm">Approved This Month</h4>
                                </div>
                                <ul className="space-y-1">
                                  {approved.map(i => (
                                    <li key={i.id} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-blue-600 mt-1">•</span>
                                      {i.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mini Cards Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <MiniCard
                            icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                            title="Key Deliveries"
                            content={snapshot.key_deliveries}
                            variant="success"
                          />
                          <MiniCard
                            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                            title="Blockers Faced"
                            content={snapshot.blockers_faced}
                            variant="warning"
                          />
                          <MiniCard
                            icon={<Lightbulb className="h-4 w-4 text-blue-600" />}
                            title="Lessons Learned"
                            content={snapshot.lessons_learned}
                            variant="info"
                          />
                          <MiniCard
                            icon={<Target className="h-4 w-4 text-primary" />}
                            title="Next Month Focus"
                            content={snapshot.next_month_focus}
                            variant="default"
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}

        <SnapshotDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          snapshot={selectedSnapshot}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Snapshot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this monthly snapshot? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
