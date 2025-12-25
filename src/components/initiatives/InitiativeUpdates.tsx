import { useState } from 'react';
import { useInitiativeUpdates, useCreateInitiativeUpdate, useUpdateInitiativeUpdate } from '@/hooks/useInitiativeUpdates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-react';

interface InitiativeUpdatesProps {
  initiativeId: string;
  personId: string;
  canAdd: boolean;
}

const statusIcons = {
  open: Circle,
  completed: CheckCircle,
  blocked: AlertTriangle,
};

const statusColors = {
  open: 'text-blue-600',
  completed: 'text-green-600',
  blocked: 'text-red-600',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export function InitiativeUpdates({ initiativeId, personId, canAdd }: InitiativeUpdatesProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  
  const { data: updates = [], isLoading } = useInitiativeUpdates(initiativeId, 'update');
  const createUpdate = useCreateInitiativeUpdate();
  const updateUpdate = useUpdateInitiativeUpdate();
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createUpdate.mutateAsync({
      initiative_id: initiativeId,
      person_id: personId,
      update_type: 'update',
      title: title.trim() || undefined,
      content: content.trim(),
      priority,
      due_date: dueDate || undefined,
    });
    
    setTitle('');
    setContent('');
    setPriority('medium');
    setDueDate('');
    setShowForm(false);
  };
  
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    await updateUpdate.mutateAsync({ id, update_status: newStatus as 'open' | 'completed' });
  };
  
  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded" />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Progress Updates</h4>
        {canAdd && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Update
          </Button>
        )}
      </div>
      
      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="What progress have you made?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-40"
                placeholder="Due date"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || createUpdate.isPending}>
                {createUpdate.isPending ? 'Adding...' : 'Add Update'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {updates.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No progress updates yet
        </p>
      ) : (
        <div className="space-y-3">
          {updates.map(update => {
            const StatusIcon = statusIcons[update.update_status || 'open'];
            
            return (
              <Card key={update.id} className="group">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => canAdd && toggleStatus(update.id, update.update_status || 'open')}
                      className={`mt-0.5 ${statusColors[update.update_status || 'open']} ${canAdd ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      disabled={!canAdd}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {update.title && (
                          <span className="font-medium">{update.title}</span>
                        )}
                        {update.priority && (
                          <Badge variant="outline" className={priorityColors[update.priority]}>
                            {update.priority}
                          </Badge>
                        )}
                        {update.due_date && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(update.due_date), 'MMM d')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {update.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {update.person?.full_name || 'Unknown'} • {format(new Date(update.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
