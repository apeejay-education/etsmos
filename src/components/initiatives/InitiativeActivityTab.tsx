import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InitiativePermissions } from '@/hooks/useInitiativePermissions';
import { InitiativeUpdates } from './InitiativeUpdates';
import { InitiativeReviews } from './InitiativeReviews';
import { InitiativeComments } from './InitiativeComments';
import { InitiativeHistory } from './InitiativeHistory';
import { useCurrentPersonContribution } from '@/hooks/useInitiativeAccess';
import { FileText, Star, MessageCircle, History } from 'lucide-react';

interface InitiativeActivityTabProps {
  initiativeId: string;
  permissions: InitiativePermissions;
}

export function InitiativeActivityTab({ initiativeId, permissions }: InitiativeActivityTabProps) {
  const { data: personData } = useCurrentPersonContribution(initiativeId);
  const personId = personData?.personId || '';

  return (
    <Tabs defaultValue="updates" className="space-y-4">
      <TabsList>
        {permissions.canAddUpdates && (
          <TabsTrigger value="updates" className="gap-2">
            <FileText className="h-4 w-4" />
            Updates
          </TabsTrigger>
        )}
        {permissions.canAddReviews && (
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
        )}
        {permissions.canAddComments && (
          <TabsTrigger value="comments" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Comments
          </TabsTrigger>
        )}
        {permissions.canSeeHistory && (
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        )}
      </TabsList>

      {permissions.canAddUpdates && (
        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle>Progress Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <InitiativeUpdates 
                initiativeId={initiativeId} 
                personId={personId}
                canAdd={permissions.canAddUpdates}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {permissions.canAddReviews && (
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <InitiativeReviews 
                initiativeId={initiativeId}
                personId={personId}
                canAdd={permissions.canAddReviews}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {permissions.canAddComments && (
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <InitiativeComments 
                initiativeId={initiativeId}
                personId={personId}
                canAdd={permissions.canAddComments}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {permissions.canSeeHistory && (
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <InitiativeHistory initiativeId={initiativeId} />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
