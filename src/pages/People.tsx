import { useState } from 'react';
import { Plus, Pencil, Trash2, Users, Award, ChevronDown, ChevronRight, UserPlus, CheckCircle, KeyRound } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { usePeople, Person } from '@/hooks/usePeople';
import { useContributions, Contribution } from '@/hooks/useContributions';
import { PersonDialog } from '@/components/people/PersonDialog';
import { ContributionDialog } from '@/components/people/ContributionDialog';
import { CreateUserDialog } from '@/components/people/CreateUserDialog';
import { ResetPasswordDialog } from '@/components/people/ResetPasswordDialog';
import { useAuth } from '@/contexts/AuthContext';

const ratingColors: Record<string, string> = {
  exceptional: 'bg-green-500/10 text-green-700 border-green-200',
  strong: 'bg-blue-500/10 text-blue-700 border-blue-200',
  meets_expectations: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  needs_improvement: 'bg-red-500/10 text-red-700 border-red-200',
};

const roleLabels: Record<string, string> = {
  lead: 'Lead',
  contributor: 'Contributor',
  reviewer: 'Reviewer',
  advisor: 'Advisor',
};

const ratingLabels: Record<string, string> = {
  exceptional: 'Exceptional',
  strong: 'Strong',
  meets_expectations: 'Meets Expectations',
  needs_improvement: 'Needs Improvement',
};

export default function People() {
  const { people, isLoading, deletePerson } = usePeople();
  const { contributions, deleteContribution } = useContributions();
  const { userRole, isAdmin } = useAuth();
  const canEdit = userRole === 'admin' || userRole === 'manager';

  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [deleteContributionId, setDeleteContributionId] = useState<string | null>(null);
  const [expandedPeople, setExpandedPeople] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedPeople(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getPersonContributions = (personId: string) => {
    return contributions.filter(c => c.person_id === personId);
  };

  const handleEditPerson = (person: Person) => {
    setSelectedPerson(person);
    setPersonDialogOpen(true);
  };

  const handleCreatePerson = () => {
    setSelectedPerson(null);
    setPersonDialogOpen(true);
  };

  const handleAddContribution = (personId: string) => {
    setSelectedContribution(null);
    setContributionDialogOpen(true);
  };

  const handleEditContribution = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setContributionDialogOpen(true);
  };

  const handleCreateUser = (person: Person) => {
    setSelectedPerson(person);
    setCreateUserDialogOpen(true);
  };

  const handleResetPassword = (person: Person) => {
    setSelectedPerson(person);
    setResetPasswordDialogOpen(true);
  };

  const handleDeletePerson = async () => {
    if (deletePersonId) {
      await deletePerson.mutateAsync(deletePersonId);
      setDeletePersonId(null);
    }
  };

  const handleDeleteContribution = async () => {
    if (deleteContributionId) {
      await deleteContribution.mutateAsync(deleteContributionId);
      setDeleteContributionId(null);
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
          <h1 className="text-3xl font-bold">People & Contributions</h1>
          <p className="text-muted-foreground">Track team members and their contributions to initiatives</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setContributionDialogOpen(true)}>
              <Award className="h-4 w-4 mr-2" />
              Add Contribution
            </Button>
            <Button onClick={handleCreatePerson}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No team members added yet</p>
            {canEdit && (
              <Button onClick={handleCreatePerson} className="mt-4">
                Add First Person
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {people.map((person) => {
            const personContributions = getPersonContributions(person.id);
            const isExpanded = expandedPeople.has(person.id);
            
            return (
              <Card key={person.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(person.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div className="text-left">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {person.full_name}
                            {person.user_id && (
                              <span title="Has login">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </span>
                            )}
                            {!person.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {[person.role_title, person.department].filter(Boolean).join(' • ') || 'No role/department set'}
                            {person.email && ` • ${person.email}`}
                          </p>
                        </div>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{personContributions.length} contributions</p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-1">
                            {isAdmin && !person.user_id && person.email && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCreateUser(person)}
                                title="Create Login"
                              >
                                <UserPlus className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {isAdmin && person.user_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleResetPassword(person)}
                                title="Reset Password"
                              >
                                <KeyRound className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPerson(person)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletePersonId(person.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {personContributions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No contributions recorded yet
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Initiative</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Summary</TableHead>
                              {canEdit && <TableHead className="w-[100px]">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {personContributions.map((contribution) => (
                              <TableRow key={contribution.id}>
                                <TableCell className="font-medium">
                                  {contribution.initiatives?.title || 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {roleLabels[contribution.contribution_role]}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {contribution.performance_rating ? (
                                    <Badge className={ratingColors[contribution.performance_rating]}>
                                      {ratingLabels[contribution.performance_rating]}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Not rated</span>
                                  )}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {contribution.contribution_summary || '-'}
                                </TableCell>
                                {canEdit && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditContribution(contribution)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteContributionId(contribution.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      <PersonDialog
        open={personDialogOpen}
        onOpenChange={setPersonDialogOpen}
        person={selectedPerson}
      />

      <ContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        contribution={selectedContribution}
      />

      {selectedPerson && (
        <CreateUserDialog
          open={createUserDialogOpen}
          onOpenChange={setCreateUserDialogOpen}
          person={selectedPerson}
        />
      )}

      {selectedPerson && (
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          person={selectedPerson}
        />
      )}

      <AlertDialog open={!!deletePersonId} onOpenChange={() => setDeletePersonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Person</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this person? This will also delete all their contributions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePerson}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteContributionId} onOpenChange={() => setDeleteContributionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contribution record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContribution}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AppLayout>
  );
}
