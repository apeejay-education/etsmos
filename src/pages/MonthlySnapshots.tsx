import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function MonthlySnapshots() {
  const { snapshots, isLoading, deleteSnapshot } = useMonthlySnapshots();
  const { userRole } = useAuth();
  const canEdit = userRole === 'admin' || userRole === 'manager';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<MonthlySnapshot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
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
        <div className="space-y-4">
          {snapshots.map((snapshot) => {
            const isExpanded = expandedIds.has(snapshot.id);
            return (
              <Card key={snapshot.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(snapshot.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <CardTitle className="text-xl">
                          {format(new Date(snapshot.month_year), 'MMMM yyyy')}
                        </CardTitle>
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
                      <p className="text-muted-foreground text-sm mt-2">{snapshot.summary}</p>
                    )}
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {snapshot.key_deliveries && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Key Deliveries</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {snapshot.key_deliveries}
                          </p>
                        </div>
                      )}
                      {snapshot.blockers_faced && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Blockers Faced</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {snapshot.blockers_faced}
                          </p>
                        </div>
                      )}
                      {snapshot.lessons_learned && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Lessons Learned</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {snapshot.lessons_learned}
                          </p>
                        </div>
                      )}
                      {snapshot.next_month_focus && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Next Month Focus</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {snapshot.next_month_focus}
                          </p>
                        </div>
                      )}
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
  );
}
