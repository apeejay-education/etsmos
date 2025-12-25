import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { PasswordResetPrompt } from '@/components/auth/PasswordResetPrompt';
import { format, differenceInDays } from 'date-fns';
import { Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, Briefcase, ClipboardCheck } from 'lucide-react';

const statusColors: Record<string, string> = {
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  dropped: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const healthColors: Record<string, string> = {
  green: 'text-green-600',
  amber: 'text-yellow-600',
  red: 'text-red-600',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const ratingLabels: Record<string, string> = {
  exceptional: 'Exceptional',
  strong: 'Strong',
  meets_expectations: 'Meets Expectations',
  needs_improvement: 'Needs Improvement',
};

const roleLabels: Record<string, string> = {
  lead: 'Lead',
  contributor: 'Contributor',
  reviewer: 'Reviewer',
  advisor: 'Advisor',
};

export function UserDashboard() {
  const {
    personId,
    mustResetPassword,
    userInitiatives,
    userContributions,
    upcomingDeadlines,
    isLoading,
  } = useUserDashboard();
  
  const { data: reviewQueue = [] } = useReviewQueue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  const activeInitiatives = userInitiatives.filter(i => i.status === 'in_progress' || i.status === 'approved');
  const completedInitiatives = userInitiatives.filter(i => i.status === 'delivered');

  return (
    <>
      {mustResetPassword && personId && (
        <PasswordResetPrompt open={mustResetPassword} personId={personId} />
      )}

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeInitiatives.length}</p>
                  <p className="text-sm text-muted-foreground">Active Initiatives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedInitiatives.length}</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userContributions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 5).map(deadline => {
                    const daysUntil = differenceInDays(new Date(deadline.tentative_delivery_date), new Date());
                    const isUrgent = daysUntil <= 7;
                    
                    return (
                      <div key={deadline.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{deadline.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={priorityColors[deadline.priority_level]}>
                              {deadline.priority_level}
                            </Badge>
                            <Badge variant="outline" className={statusColors[deadline.status]}>
                              {deadline.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className={`text-right ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                          <p className="font-medium text-sm">
                            {format(new Date(deadline.tentative_delivery_date), 'MMM d')}
                          </p>
                          <p className="text-xs">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Initiatives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                My Initiatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeInitiatives.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active initiatives</p>
              ) : (
                <div className="space-y-3">
                  {activeInitiatives.slice(0, 5).map(initiative => (
                    <div key={initiative.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{initiative.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{initiative.product_name}</p>
                        </div>
                        {initiative.health_status && (
                          <div className={`flex items-center gap-1 ${healthColors[initiative.health_status]}`}>
                            {initiative.health_status === 'red' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : initiative.health_status === 'amber' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={statusColors[initiative.status]}>
                          {initiative.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {roleLabels[initiative.contribution_role] || initiative.contribution_role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Queue - only show if user has items to review */}
        {reviewQueue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Items Needing Your Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewQueue.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.initiative_title}</p>
                      <p className="text-xs text-muted-foreground">{item.product_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.pending_updates_count > 0 && (
                        <Badge variant="secondary">
                          {item.pending_updates_count} pending
                        </Badge>
                      )}
                      <Badge variant="outline" className={priorityColors[item.priority_level]}>
                        {item.priority_level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Contributions */}
        <Card>
          <CardHeader>
            <CardTitle>My Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {userContributions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No contributions yet</p>
            ) : (
              <div className="space-y-4">
                {userContributions.map(contribution => (
                  <div key={contribution.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{contribution.initiative_title}</p>
                        <Badge variant="secondary" className="mt-1">
                          {roleLabels[contribution.contribution_role] || contribution.contribution_role}
                        </Badge>
                      </div>
                      {contribution.performance_rating && (
                        <Badge variant="outline">
                          {ratingLabels[contribution.performance_rating] || contribution.performance_rating}
                        </Badge>
                      )}
                    </div>
                    {contribution.contribution_summary && (
                      <p className="text-sm text-muted-foreground mt-2">{contribution.contribution_summary}</p>
                    )}
                    {contribution.assessment_notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Assessment Notes:</p>
                        <p>{contribution.assessment_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}