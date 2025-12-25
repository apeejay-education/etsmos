import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Initiative } from '@/types/database';
import { InitiativePermissions } from '@/hooks/useInitiativePermissions';
import { Calendar, Target, User, Shield, FileText } from 'lucide-react';

interface InitiativeOverviewTabProps {
  initiative: Initiative;
  permissions: InitiativePermissions;
}

export function InitiativeOverviewTab({ initiative, permissions }: InitiativeOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Context & Outcome */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Context & Expected Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {initiative.context ? (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Why this exists</h4>
                <p className="text-sm">{initiative.context}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No context provided</p>
            )}
            
            {initiative.expected_outcome && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Outcome</h4>
                <p className="text-sm">{initiative.expected_outcome}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Status */}
        {(initiative.status === 'delivered' || initiative.delivered_outcome_summary) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Delivery Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {initiative.delivered_outcome_summary && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivered Outcome</h4>
                  <p className="text-sm">{initiative.delivered_outcome_summary}</p>
                </div>
              )}
              
              {initiative.outcome_vs_intent && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Outcome vs Intent</h4>
                  <Badge variant="outline" className="capitalize">{initiative.outcome_vs_intent}</Badge>
                </div>
              )}
              
              {initiative.closure_notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Closure Notes</h4>
                  <p className="text-sm">{initiative.closure_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Key Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{format(new Date(initiative.created_at), 'MMM d, yyyy')}</span>
            </div>
            
            {initiative.approval_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span>{format(new Date(initiative.approval_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {initiative.tentative_delivery_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Delivery</span>
                <span className={
                  new Date(initiative.tentative_delivery_date) < new Date() && 
                  initiative.status !== 'delivered' && 
                  initiative.status !== 'dropped'
                    ? 'text-destructive font-medium'
                    : ''
                }>
                  {format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            
            {initiative.actual_delivery_date && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actual Delivery</span>
                <span className="text-green-600">{format(new Date(initiative.actual_delivery_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ownership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Ownership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accountable Owner</span>
              <span>{initiative.accountable_owner || '-'}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Escalation Owner</span>
              <span>{initiative.escalation_owner || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Approval & Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Approval Source</span>
              <Badge variant="outline" className="capitalize">{initiative.approval_source}</Badge>
            </div>
            
            {initiative.approving_authority && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approving Authority</span>
                <span>{initiative.approving_authority}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Sensitivity</span>
              <Badge variant="outline" className="capitalize">{initiative.sensitivity_level}</Badge>
            </div>
            
            {initiative.strategic_category && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline" className="capitalize">{initiative.strategic_category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
