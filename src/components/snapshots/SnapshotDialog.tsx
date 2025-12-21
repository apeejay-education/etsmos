import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, startOfMonth } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMonthlySnapshots, MonthlySnapshot, MonthlySnapshotInsert } from '@/hooks/useMonthlySnapshots';
import { useAuth } from '@/contexts/AuthContext';

interface SnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot?: MonthlySnapshot | null;
}

// Zod validation schema with proper length constraints
const snapshotSchema = z.object({
  month_year: z.string().min(1, 'Month is required'),
  summary: z.string().max(2000, 'Summary must be less than 2000 characters').or(z.literal('')),
  key_deliveries: z.string().max(2000, 'Key deliveries must be less than 2000 characters').or(z.literal('')),
  blockers_faced: z.string().max(1000, 'Blockers must be less than 1000 characters').or(z.literal('')),
  lessons_learned: z.string().max(1000, 'Lessons learned must be less than 1000 characters').or(z.literal('')),
  next_month_focus: z.string().max(1000, 'Next month focus must be less than 1000 characters').or(z.literal('')),
});

type FormData = z.infer<typeof snapshotSchema>;

export function SnapshotDialog({ open, onOpenChange, snapshot }: SnapshotDialogProps) {
  const { user } = useAuth();
  const { createSnapshot, updateSnapshot } = useMonthlySnapshots();
  const isEditing = !!snapshot;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(snapshotSchema),
    defaultValues: {
      month_year: format(startOfMonth(new Date()), 'yyyy-MM'),
      summary: '',
      key_deliveries: '',
      blockers_faced: '',
      lessons_learned: '',
      next_month_focus: '',
    },
  });

  useEffect(() => {
    if (snapshot) {
      reset({
        month_year: snapshot.month_year.substring(0, 7),
        summary: snapshot.summary || '',
        key_deliveries: snapshot.key_deliveries || '',
        blockers_faced: snapshot.blockers_faced || '',
        lessons_learned: snapshot.lessons_learned || '',
        next_month_focus: snapshot.next_month_focus || '',
      });
    } else {
      reset({
        month_year: format(startOfMonth(new Date()), 'yyyy-MM'),
        summary: '',
        key_deliveries: '',
        blockers_faced: '',
        lessons_learned: '',
        next_month_focus: '',
      });
    }
  }, [snapshot, reset]);

  const onSubmit = async (data: FormData) => {
    const monthDate = `${data.month_year}-01`;
    
    const snapshotData: MonthlySnapshotInsert = {
      month_year: monthDate,
      summary: data.summary?.trim() || null,
      key_deliveries: data.key_deliveries?.trim() || null,
      blockers_faced: data.blockers_faced?.trim() || null,
      lessons_learned: data.lessons_learned?.trim() || null,
      next_month_focus: data.next_month_focus?.trim() || null,
      created_by: user?.id || null,
    };

    if (isEditing && snapshot) {
      await updateSnapshot.mutateAsync({ id: snapshot.id, ...snapshotData });
    } else {
      await createSnapshot.mutateAsync(snapshotData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Monthly Snapshot' : 'New Monthly Snapshot'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="month_year">Month</Label>
            <Input
              id="month_year"
              type="month"
              {...register('month_year')}
            />
            {errors.month_year && (
              <p className="text-sm text-destructive mt-1">{errors.month_year.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="High-level summary of the month..."
              rows={3}
              maxLength={2000}
              {...register('summary')}
            />
            {errors.summary && (
              <p className="text-sm text-destructive mt-1">{errors.summary.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="key_deliveries">Key Deliveries</Label>
            <Textarea
              id="key_deliveries"
              placeholder="What was delivered this month..."
              rows={4}
              maxLength={2000}
              {...register('key_deliveries')}
            />
            {errors.key_deliveries && (
              <p className="text-sm text-destructive mt-1">{errors.key_deliveries.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="blockers_faced">Blockers Faced</Label>
            <Textarea
              id="blockers_faced"
              placeholder="Challenges and blockers encountered..."
              rows={3}
              maxLength={1000}
              {...register('blockers_faced')}
            />
            {errors.blockers_faced && (
              <p className="text-sm text-destructive mt-1">{errors.blockers_faced.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lessons_learned">Lessons Learned</Label>
            <Textarea
              id="lessons_learned"
              placeholder="Key takeaways and learnings..."
              rows={3}
              maxLength={1000}
              {...register('lessons_learned')}
            />
            {errors.lessons_learned && (
              <p className="text-sm text-destructive mt-1">{errors.lessons_learned.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="next_month_focus">Next Month Focus</Label>
            <Textarea
              id="next_month_focus"
              placeholder="Priorities for the upcoming month..."
              rows={3}
              maxLength={1000}
              {...register('next_month_focus')}
            />
            {errors.next_month_focus && (
              <p className="text-sm text-destructive mt-1">{errors.next_month_focus.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSnapshot.isPending || updateSnapshot.isPending}>
              {isEditing ? 'Update' : 'Create'} Snapshot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
