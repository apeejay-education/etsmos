import { useState } from 'react';
import { useInitiativeUpdates, useCreateInitiativeUpdate } from '@/hooks/useInitiativeUpdates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, FileText, CheckCircle } from 'lucide-react';

interface InitiativeReviewsProps {
  initiativeId: string;
  personId: string;
  canAdd: boolean;
}

export function InitiativeReviews({ initiativeId, personId, canAdd }: InitiativeReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [isClosure, setIsClosure] = useState(false);
  
  const { data: reviews = [], isLoading } = useInitiativeUpdates(initiativeId, ['review', 'closure']);
  const createUpdate = useCreateInitiativeUpdate();
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createUpdate.mutateAsync({
      initiative_id: initiativeId,
      person_id: personId,
      update_type: isClosure ? 'closure' : 'review',
      content: content.trim(),
    });
    
    setContent('');
    setIsClosure(false);
    setShowForm(false);
  };
  
  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded" />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Review Notes</h4>
        {canAdd && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Review
          </Button>
        )}
      </div>
      
      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Textarea
              placeholder="Enter your review notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClosure}
                  onChange={(e) => setIsClosure(e.target.checked)}
                  className="rounded border-input"
                />
                Mark as Closure Note
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || createUpdate.isPending}>
                {createUpdate.isPending ? 'Adding...' : 'Add Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No review notes yet
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {review.update_type === 'closure' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={review.update_type === 'closure' ? 'default' : 'outline'}>
                        {review.update_type === 'closure' ? 'Closure Note' : 'Review'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                      {review.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {review.person?.full_name || 'Unknown'} • {format(new Date(review.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
