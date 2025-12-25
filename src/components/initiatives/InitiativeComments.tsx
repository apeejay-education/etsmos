import { useState } from 'react';
import { useInitiativeUpdates, useCreateInitiativeUpdate } from '@/hooks/useInitiativeUpdates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';

interface InitiativeCommentsProps {
  initiativeId: string;
  personId: string;
  canAdd: boolean;
}

export function InitiativeComments({ initiativeId, personId, canAdd }: InitiativeCommentsProps) {
  const [content, setContent] = useState('');
  
  const { data: comments = [], isLoading } = useInitiativeUpdates(initiativeId, 'comment');
  const createUpdate = useCreateInitiativeUpdate();
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createUpdate.mutateAsync({
      initiative_id: initiativeId,
      person_id: personId,
      update_type: 'comment',
      content: content.trim(),
    });
    
    setContent('');
  };
  
  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded" />;
  }
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Comments</h4>
      
      {canAdd && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <Button 
            size="icon" 
            onClick={handleSubmit} 
            disabled={!content.trim() || createUpdate.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No comments yet
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {comment.person?.full_name || 'Unknown'} • {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
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
