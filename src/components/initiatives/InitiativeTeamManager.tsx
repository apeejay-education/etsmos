import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContributions, ContributionRole } from '@/hooks/useContributions';
import { usePeople, Person } from '@/hooks/usePeople';
import { Trash2, UserPlus } from 'lucide-react';

interface InitiativeTeamManagerProps {
  initiativeId: string | null;
}

const roleLabels: Record<ContributionRole, string> = {
  lead: 'Lead',
  contributor: 'Contributor',
  reviewer: 'Reviewer',
  advisor: 'Advisor',
};

const roleBadgeVariants: Record<ContributionRole, 'default' | 'secondary' | 'outline'> = {
  lead: 'default',
  contributor: 'secondary',
  reviewer: 'outline',
  advisor: 'outline',
};

export function InitiativeTeamManager({ initiativeId }: InitiativeTeamManagerProps) {
  const { people, isLoading: loadingPeople } = usePeople();
  const { contributions, createContribution, deleteContribution, isLoading: loadingContributions } = useContributions(initiativeId || undefined);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ContributionRole>('contributor');

  if (!initiativeId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Save the initiative first to add team members
      </div>
    );
  }

  const assignedPersonIds = new Set(contributions.map(c => c.person_id));
  const availablePeople = people.filter(p => p.is_active && !assignedPersonIds.has(p.id));

  const handleAddMember = () => {
    if (!selectedPersonId || !initiativeId) return;
    
    createContribution.mutate({
      person_id: selectedPersonId,
      initiative_id: initiativeId,
      contribution_role: selectedRole,
      contribution_summary: null,
      performance_rating: null,
      assessment_notes: null,
      assessed_by: null,
      assessed_at: null,
    });
    
    setSelectedPersonId('');
  };

  const handleRemoveMember = (contributionId: string) => {
    deleteContribution.mutate(contributionId);
  };

  const isLoading = loadingPeople || loadingContributions;

  return (
    <div className="space-y-4">
      {/* Add member form */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Add Team Member</label>
          <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
            <SelectTrigger>
              <SelectValue placeholder="Select person..." />
            </SelectTrigger>
            <SelectContent>
              {availablePeople.map(person => (
                <SelectItem key={person.id} value={person.id}>
                  {person.full_name} {person.department && `(${person.department})`}
                </SelectItem>
              ))}
              {availablePeople.length === 0 && (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  No available people
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-36">
          <label className="text-sm font-medium mb-1 block">Role</label>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ContributionRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
              <SelectItem value="advisor">Advisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleAddMember} 
          disabled={!selectedPersonId || createContribution.isPending}
          size="icon"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Current team members */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Team</label>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : contributions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
            No team members assigned yet
          </div>
        ) : (
          <div className="space-y-2">
            {contributions.map(contribution => (
              <div 
                key={contribution.id} 
                className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contribution.people?.full_name}</span>
                  {contribution.people?.department && (
                    <span className="text-sm text-muted-foreground">
                      ({contribution.people.department})
                    </span>
                  )}
                  <Badge variant={roleBadgeVariants[contribution.contribution_role]}>
                    {roleLabels[contribution.contribution_role]}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(contribution.id)}
                  disabled={deleteContribution.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
