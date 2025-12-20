import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExecutionSignal, Initiative } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const signalSchema = z.object({
  initiative_id: z.string().uuid('Please select an initiative'),
  execution_stage: z.enum(['not_started', 'active', 'paused', 'completed'] as const),
  health_status: z.enum(['green', 'amber', 'red'] as const),
  risk_blocker_summary: z.string().max(1000).nullable(),
  last_management_touch: z.string().nullable(),
  next_expected_movement: z.string().nullable(),
  jira_epics: z.string().max(500).nullable(),
  last_jira_activity: z.string().nullable()
});

type SignalFormData = z.infer<typeof signalSchema>;

interface ExecutionSignalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: ExecutionSignal | null;
  initiativeId?: string;
  initiatives: Initiative[];
  onSubmit: (data: SignalFormData) => void;
  isLoading: boolean;
}

export function ExecutionSignalDialog({ 
  open, 
  onOpenChange, 
  signal,
  initiativeId,
  initiatives,
  onSubmit, 
  isLoading 
}: ExecutionSignalDialogProps) {
  const form = useForm<SignalFormData>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      initiative_id: '',
      execution_stage: 'not_started',
      health_status: 'green',
      risk_blocker_summary: null,
      last_management_touch: null,
      next_expected_movement: null,
      jira_epics: null,
      last_jira_activity: null
    }
  });

  useEffect(() => {
    if (signal) {
      form.reset({
        initiative_id: signal.initiative_id,
        execution_stage: signal.execution_stage,
        health_status: signal.health_status,
        risk_blocker_summary: signal.risk_blocker_summary,
        last_management_touch: signal.last_management_touch ? 
          new Date(signal.last_management_touch).toISOString().slice(0, 16) : null,
        next_expected_movement: signal.next_expected_movement,
        jira_epics: signal.jira_epics,
        last_jira_activity: signal.last_jira_activity ?
          new Date(signal.last_jira_activity).toISOString().slice(0, 16) : null
      });
    } else {
      form.reset({
        initiative_id: initiativeId || '',
        execution_stage: 'not_started',
        health_status: 'green',
        risk_blocker_summary: null,
        last_management_touch: new Date().toISOString().slice(0, 16),
        next_expected_movement: null,
        jira_epics: null,
        last_jira_activity: null
      });
    }
  }, [signal, initiativeId, form]);

  const handleSubmit = (data: SignalFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{signal ? 'Update Execution Signal' : 'Create Execution Signal'}</DialogTitle>
          <DialogDescription>
            {signal ? 'Update the execution health signal' : 'Track execution health for an initiative'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!signal && !initiativeId && (
              <FormField
                control={form.control}
                name="initiative_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initiative</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select initiative" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {initiatives.map(i => (
                          <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="execution_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="green">🟢 Green</SelectItem>
                        <SelectItem value="amber">🟡 Amber</SelectItem>
                        <SelectItem value="red">🔴 Red</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="risk_blocker_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risks / Blockers</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any risks or blockers..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="last_management_touch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Management Touch</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_expected_movement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Expected Movement</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jira_epics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira Epics (for reference)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Epic keys or links" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (signal ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
