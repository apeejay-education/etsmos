import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContributions, Contribution, ContributionInsert, ContributionRole, PerformanceRating } from '@/hooks/useContributions';
import { usePeople } from '@/hooks/usePeople';
import { useInitiatives } from '@/hooks/useInitiatives';
import { useAuth } from '@/contexts/AuthContext';

interface ContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contribution?: Contribution | null;
  defaultPersonId?: string;
  defaultInitiativeId?: string;
}

interface FormData {
  person_id: string;
  initiative_id: string;
  contribution_role: ContributionRole;
  contribution_summary: string;
  performance_rating: PerformanceRating | '';
  assessment_notes: string;
}

const roleOptions: { value: ContributionRole; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'advisor', label: 'Advisor' },
];

const ratingOptions: { value: PerformanceRating; label: string }[] = [
  { value: 'exceptional', label: 'Exceptional' },
  { value: 'strong', label: 'Strong' },
  { value: 'meets_expectations', label: 'Meets Expectations' },
  { value: 'needs_improvement', label: 'Needs Improvement' },
];

export function ContributionDialog({ 
  open, 
  onOpenChange, 
  contribution,
  defaultPersonId,
  defaultInitiativeId,
}: ContributionDialogProps) {
  const { user } = useAuth();
  const { createContribution, updateContribution } = useContributions();
  const { people } = usePeople();
  const { data: initiatives = [] } = useInitiatives();
  const isEditing = !!contribution;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      person_id: defaultPersonId || '',
      initiative_id: defaultInitiativeId || '',
      contribution_role: 'contributor',
      contribution_summary: '',
      performance_rating: '',
      assessment_notes: '',
    },
  });

  const selectedPersonId = watch('person_id');
  const selectedInitiativeId = watch('initiative_id');
  const selectedRole = watch('contribution_role');
  const selectedRating = watch('performance_rating');

  useEffect(() => {
    if (contribution) {
      reset({
        person_id: contribution.person_id,
        initiative_id: contribution.initiative_id,
        contribution_role: contribution.contribution_role,
        contribution_summary: contribution.contribution_summary || '',
        performance_rating: contribution.performance_rating || '',
        assessment_notes: contribution.assessment_notes || '',
      });
    } else {
      reset({
        person_id: defaultPersonId || '',
        initiative_id: defaultInitiativeId || '',
        contribution_role: 'contributor',
        contribution_summary: '',
        performance_rating: '',
        assessment_notes: '',
      });
    }
  }, [contribution, defaultPersonId, defaultInitiativeId, reset]);

  const onSubmit = async (data: FormData) => {
    const contributionData: ContributionInsert = {
      person_id: data.person_id,
      initiative_id: data.initiative_id,
      contribution_role: data.contribution_role,
      contribution_summary: data.contribution_summary || null,
      performance_rating: data.performance_rating || null,
      assessment_notes: data.assessment_notes || null,
      assessed_by: data.performance_rating ? user?.id || null : null,
      assessed_at: data.performance_rating ? new Date().toISOString() : null,
    };

    if (isEditing && contribution) {
      await updateContribution.mutateAsync({ id: contribution.id, ...contributionData });
    } else {
      await createContribution.mutateAsync(contributionData);
    }
    
    onOpenChange(false);
  };

  const activePeople = people.filter(p => p.is_active);
  const activeInitiatives = initiatives.filter(i => 
    i.status === 'approved' || i.status === 'in_progress'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contribution' : 'Add Contribution'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Person *</Label>
            <Select
              value={selectedPersonId}
              onValueChange={(value) => setValue('person_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {activePeople.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.full_name} {person.role_title && `(${person.role_title})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.person_id && (
              <p className="text-sm text-destructive mt-1">{errors.person_id.message}</p>
            )}
          </div>

          <div>
            <Label>Initiative *</Label>
            <Select
              value={selectedInitiativeId}
              onValueChange={(value) => setValue('initiative_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select initiative" />
              </SelectTrigger>
              <SelectContent>
                {activeInitiatives.map((initiative) => (
                  <SelectItem key={initiative.id} value={initiative.id}>
                    {initiative.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.initiative_id && (
              <p className="text-sm text-destructive mt-1">{errors.initiative_id.message}</p>
            )}
          </div>

          <div>
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('contribution_role', value as ContributionRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contribution_summary">Contribution Summary</Label>
            <Textarea
              id="contribution_summary"
              placeholder="Describe the person's contribution..."
              rows={3}
              {...register('contribution_summary')}
            />
          </div>

          <div>
            <Label>Performance Rating</Label>
            <Select
              value={selectedRating}
              onValueChange={(value) => setValue('performance_rating', value as PerformanceRating)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating (optional)" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assessment_notes">Assessment Notes</Label>
            <Textarea
              id="assessment_notes"
              placeholder="Additional assessment notes..."
              rows={2}
              {...register('assessment_notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createContribution.isPending || updateContribution.isPending || !selectedPersonId || !selectedInitiativeId}
            >
              {isEditing ? 'Update' : 'Add'} Contribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
