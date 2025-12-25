import { useState, useRef, useEffect } from 'react';
import { useInitiativeChat } from '@/hooks/useInitiativeChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InitiativeChatProps {
  initiativeId: string;
  personId: string | null;
  personName: string | null;
  canSendMessages: boolean;
}

export function InitiativeChat({ initiativeId, personId, personName, canSendMessages }: InitiativeChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, deleteMessage } = useInitiativeChat(initiativeId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !personId) return;
    
    try {
      await sendMessage.mutateAsync({ message: message.trim(), personId });
      setMessage('');
    } catch (error: any) {
      toast.error('Failed to send message: ' + error.message);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
      toast.success('Message deleted');
    } catch (error: any) {
      toast.error('Failed to delete message: ' + error.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 p-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.person_id === personId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {msg.people?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>{msg.people?.full_name || 'Unknown'}</span>
                      <span>{format(new Date(msg.created_at), 'MMM d, h:mm a')}</span>
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.message}
                    </div>
                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 mt-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {canSendMessages && personId ? (
        <form onSubmit={handleSend} className="flex gap-2 mt-4 pt-4 border-t">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
          {!personId ? 'Link your account to a person to participate in chat' : 'You can only view this chat'}
        </div>
      )}
    </div>
  );
}
