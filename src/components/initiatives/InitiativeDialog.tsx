import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Initiative, Product } from '@/types/database';
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
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateDeliveryWindow, formatDeliveryWindow } from '@/utils/deliveryWindowCalculator';
import { InitiativeTeamManager } from './InitiativeTeamManager';
import { InitiativeChat } from './InitiativeChat';
import { InitiativeUpdates } from './InitiativeUpdates';
import { InitiativeReviews } from './InitiativeReviews';
import { InitiativeComments } from './InitiativeComments';
import { InitiativeHistory } from './InitiativeHistory';
import { InitiativeResourceAllocation } from './InitiativeResourceAllocation';
import { InitiativeTasksTab } from './InitiativeTasksTab';
import { useCurrentPersonContribution } from '@/hooks/useInitiativeAccess';
import { useAuth } from '@/contexts/AuthContext';

const initiativeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  context: z.string().max(2000).nullable(),
  expected_outcome: z.string().max(1000).nullable(),
  product_id: z.string().uuid('Please select a product'),
  approval_source: z.enum(['board', 'chairman', 'management', 'internal'] as const),
  approving_authority: z.string().max(100).nullable(),
  approval_date: z.string().nullable(),
  approval_evidence: z.string().max(500).nullable(),
  strategic_category: z.enum(['revenue', 'compliance', 'operations', 'quality', 'brand'] as const).nullable(),
  sensitivity_level: z.enum(['confidential', 'internal', 'routine'] as const),
  priority_level: z.enum(['high', 'medium', 'low'] as const),
  accountable_owner: z.string().max(100).nullable(),
  escalation_owner: z.string().max(100).nullable(),
  status: z.enum(['approved', 'in_progress', 'blocked', 'delivered', 'dropped'] as const),
  target_delivery_window: z.enum(['immediate', 'month', 'quarter', 'flexible'] as const),
  tentative_delivery_date: z.string().nullable(),
  actual_delivery_date: z.string().nullable(),
  delivered_outcome_summary: z.string().max(2000).nullable(),
  outcome_vs_intent: z.enum(['fully', 'partial', 'missed'] as const).nullable(),
  closure_notes: z.string().max(2000).nullable()
});

type InitiativeFormData = z.infer<typeof initiativeSchema>;

interface InitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initiative: Initiative | null;
  products: Product[];
  onSubmit: (data: InitiativeFormData) => void;
  isLoading: boolean;
}

export function InitiativeDialog({ 
  open, 
  onOpenChange, 
  initiative, 
  products,
  onSubmit, 
  isLoading 
}: InitiativeDialogProps) {
  const { canEdit: globalCanEdit, userRole } = useAuth();
  const { data: personData } = useCurrentPersonContribution(initiative?.id || null);
  
  // Admin has FULL access to everything - override all other checks
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isAdminOrManager = isAdmin || isManager;
  
  // User can edit if they're admin/manager OR if they're a lead on this initiative
  const isLead = personData?.contributionRole === 'lead';
  const isContributor = personData?.contributionRole === 'contributor';
  const isReviewer = personData?.contributionRole === 'reviewer';
  const canEditInitiative = globalCanEdit || isLead;
  const isTaggedUser = personData?.isTagged ?? false;
  
  // Admin always has access to everything, regardless of whether they have a person record
  const hasPersonId = !!personData?.personId;
  
  // CRITICAL: Admin and Manager see ALL tabs and can do everything, regardless of person record
  const canAccessChat = isAdminOrManager || isTaggedUser;
  const canSeeUpdates = isAdminOrManager || isLead || isContributor;
  const canAddUpdates = isAdminOrManager || isLead || isContributor;
  const canSeeReviews = isAdminOrManager || isLead || isReviewer;
  const canAddReviews = isAdminOrManager || isLead || isReviewer;
  const canSeeComments = isAdminOrManager || isTaggedUser;
  const canAddComments = isAdminOrManager || isTaggedUser;
  const canSeeHistory = isAdminOrManager || isLead;
  const canSeeTasks = isAdminOrManager || isLead || isContributor || isReviewer;
  const canManageTasks = isAdminOrManager || isLead;
  
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      title: '',
      context: null,
      expected_outcome: null,
      product_id: '',
      approval_source: 'internal',
      approving_authority: null,
      approval_date: null,
      approval_evidence: null,
      strategic_category: null,
      sensitivity_level: 'routine',
      priority_level: 'medium',
      accountable_owner: null,
      escalation_owner: null,
      status: 'approved',
      target_delivery_window: 'flexible',
      tentative_delivery_date: null,
      actual_delivery_date: null,
      delivered_outcome_summary: null,
      outcome_vs_intent: null,
      closure_notes: null
    }
  });

  useEffect(() => {
    if (initiative) {
      form.reset({
        title: initiative.title,
        context: initiative.context,
        expected_outcome: initiative.expected_outcome,
        product_id: initiative.product_id,
        approval_source: initiative.approval_source,
        approving_authority: initiative.approving_authority,
        approval_date: initiative.approval_date,
        approval_evidence: initiative.approval_evidence,
        strategic_category: initiative.strategic_category,
        sensitivity_level: initiative.sensitivity_level,
        priority_level: initiative.priority_level,
        accountable_owner: initiative.accountable_owner,
        escalation_owner: initiative.escalation_owner,
        status: initiative.status,
        target_delivery_window: initiative.target_delivery_window,
        tentative_delivery_date: initiative.tentative_delivery_date,
        actual_delivery_date: initiative.actual_delivery_date,
        delivered_outcome_summary: initiative.delivered_outcome_summary,
        outcome_vs_intent: initiative.outcome_vs_intent,
        closure_notes: initiative.closure_notes
      });
    } else {
      form.reset({
        title: '',
        context: null,
        expected_outcome: null,
        product_id: products[0]?.id || '',
        approval_source: 'internal',
        approving_authority: null,
        approval_date: null,
        approval_evidence: null,
        strategic_category: null,
        sensitivity_level: 'routine',
        priority_level: 'medium',
        accountable_owner: null,
        escalation_owner: null,
        status: 'approved',
        target_delivery_window: 'flexible',
        tentative_delivery_date: null,
        actual_delivery_date: null,
        delivered_outcome_summary: null,
        outcome_vs_intent: null,
        closure_notes: null
      });
    }
  }, [initiative, form, products]);

  // Auto-calculate target window when tentative date changes
  const tentativeDate = form.watch('tentative_delivery_date');
  useEffect(() => {
    if (tentativeDate) {
      const calculatedWindow = calculateDeliveryWindow(tentativeDate);
      form.setValue('target_delivery_window', calculatedWindow);
    }
  }, [tentativeDate, form]);

  const handleSubmit = (data: InitiativeFormData) => {
    onSubmit(data);
  };

  const status = form.watch('status');
  const isDelivered = status === 'delivered';
  const currentWindow = form.watch('target_delivery_window');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initiative ? 'Edit Initiative' : 'Create Initiative'}</DialogTitle>
          <DialogDescription>
            {initiative ? 'Update initiative details' : 'Add a new approved initiative'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs defaultValue={initiative ? "updates" : "core"} className="w-full">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex w-auto min-w-full">
                  <TabsTrigger value="core">Core</TabsTrigger>
                  <TabsTrigger value="approval">Approval</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  {initiative && (
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  )}
                  {initiative && canSeeTasks && (
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  )}
                  {initiative && canSeeUpdates && (
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                  )}
                  {initiative && canSeeReviews && (
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  )}
                  {initiative && canSeeComments && (
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  )}
                  {initiative && canSeeHistory && (
                    <TabsTrigger value="history">History</TabsTrigger>
                  )}
                  {initiative && canAccessChat && (
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  )}
                </TabsList>
              </ScrollArea>

              <TabsContent value="core" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Executive-readable title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context (Why this exists)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Background and rationale..."
                          className="min-h-[100px]"
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
                  name="expected_outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Outcome</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Business outcome, not tasks..."
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
                    name="priority_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sensitivity_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sensitivity</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="confidential">Confidential</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accountable_owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accountable Owner</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Single person" 
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
                    name="escalation_owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escalation Owner</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Escalation contact" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="approval" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="approval_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="board">Board</SelectItem>
                            <SelectItem value="chairman">Chairman</SelectItem>
                            <SelectItem value="management">Management</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="approving_authority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approving Authority</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Name or title" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="approval_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Date</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="strategic_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strategic Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="quality">Quality</SelectItem>
                            <SelectItem value="brand">Brand</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="approval_evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approval Evidence</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Link to email, document, etc." 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tentative_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tentative Delivery Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Auto-calculates Target Window
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="target_delivery_window"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Delivery Window</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (≤10 days)</SelectItem>
                          <SelectItem value="month">This Month (10-30 days)</SelectItem>
                          <SelectItem value="quarter">This Quarter (30-70 days)</SelectItem>
                          <SelectItem value="flexible">Flexible (&gt;70 days)</SelectItem>
                        </SelectContent>
                      </Select>
                      {tentativeDate && (
                        <FormDescription className="text-xs">
                          Calculated: {formatDeliveryWindow(currentWindow)}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isDelivered && (
                  <>
                    <FormField
                      control={form.control}
                      name="actual_delivery_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Delivery Date</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="delivered_outcome_summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivered Outcome Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What was actually delivered..."
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
                      name="outcome_vs_intent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outcome vs Intent</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How well did we deliver?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fully">Fully Matched</SelectItem>
                              <SelectItem value="partial">Partially Matched</SelectItem>
                              <SelectItem value="missed">Missed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="closure_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closure Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes..."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="team" className="space-y-4 mt-4">
                <InitiativeTeamManager initiativeId={initiative?.id || null} />
              </TabsContent>

              {initiative && canSeeTasks && (
                <TabsContent value="tasks" className="space-y-4 mt-4">
                  <InitiativeTasksTab 
                    initiativeId={initiative.id}
                    canManage={canManageTasks}
                  />
                </TabsContent>
              )}

              {initiative && canSeeUpdates && (
                <TabsContent value="updates" className="space-y-4 mt-4">
                  <InitiativeUpdates 
                    initiativeId={initiative.id}
                    personId={personData?.personId || ''}
                    canAdd={canAddUpdates}
                  />
                </TabsContent>
              )}

              {initiative && canSeeReviews && (
                <TabsContent value="reviews" className="space-y-4 mt-4">
                  <InitiativeReviews 
                    initiativeId={initiative.id}
                    personId={personData?.personId || ''}
                    canAdd={canAddReviews}
                  />
                </TabsContent>
              )}

              {initiative && canSeeComments && (
                <TabsContent value="comments" className="space-y-4 mt-4">
                  <InitiativeComments 
                    initiativeId={initiative.id}
                    personId={personData?.personId || ''}
                    canAdd={canAddComments}
                  />
                </TabsContent>
              )}

              {initiative && canSeeHistory && (
                <TabsContent value="history" className="space-y-4 mt-4">
                  <InitiativeHistory initiativeId={initiative.id} />
                </TabsContent>
              )}

              {initiative && canAccessChat && (
                <TabsContent value="chat" className="space-y-4 mt-4">
                  <InitiativeChat 
                    initiativeId={initiative.id}
                    personId={personData?.personId || null}
                    personName={personData?.personName || null}
                    canSendMessages={isAdminOrManager || hasPersonId}
                  />
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {canEditInitiative ? 'Cancel' : 'Close'}
              </Button>
              {canEditInitiative && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (initiative ? 'Update' : 'Create')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
