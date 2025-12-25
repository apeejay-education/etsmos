import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Initiative, Product } from '@/types/database';
import { useCreateInitiative, useUpdateInitiative } from '@/hooks/useInitiatives';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateDeliveryWindow, formatDeliveryWindow } from '@/utils/deliveryWindowCalculator';
import { Loader2, Save } from 'lucide-react';

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
  closure_notes: z.string().max(2000).nullable(),
  complexity: z.enum(['low', 'medium', 'high'] as const),
});

type InitiativeFormData = z.infer<typeof initiativeSchema>;

interface InitiativeEditFormProps {
  initiative: Initiative | null;
  products: Product[];
  isNew: boolean;
  onSuccess: () => void;
}

export function InitiativeEditForm({ initiative, products, isNew, onSuccess }: InitiativeEditFormProps) {
  const navigate = useNavigate();
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();
  
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
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
      closure_notes: null,
      complexity: 'medium',
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
        closure_notes: initiative.closure_notes,
        complexity: initiative.complexity || 'medium',
      });
    } else if (products.length > 0) {
      form.setValue('product_id', products[0].id);
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
    const submitData = {
      ...data,
      title: data.title,
      product_id: data.product_id,
    };
    if (isNew) {
      createInitiative.mutate(submitData as any, {
        onSuccess: () => {
          onSuccess();
        }
      });
    } else if (initiative) {
      updateInitiative.mutate({ id: initiative.id, ...submitData }, {
        onSuccess: () => {
          onSuccess();
        }
      });
    }
  };

  const isLoading = createInitiative.isPending || updateInitiative.isPending;
  const status = form.watch('status');
  const isDelivered = status === 'delivered';
  const currentWindow = form.watch('target_delivery_window');

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            You need to create at least one product before creating initiatives.
          </p>
          <Button type="button" onClick={() => navigate('/products')}>
            Go to Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="core" className="space-y-4">
          <TabsList>
            <TabsTrigger value="core">Core Details</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            {isDelivered && <TabsTrigger value="closure">Closure</TabsTrigger>}
          </TabsList>

          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle>Core Details</CardTitle>
                <CardDescription>Basic information about the initiative</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    name="complexity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complexity</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select 
                          onValueChange={(v) => field.onChange(v === 'none' ? null : v)} 
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle>Approval Details</CardTitle>
                <CardDescription>Approval source and authorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    name="approval_evidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Evidence</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Meeting notes, email reference..." 
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>Status and timeline information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    name="target_delivery_window"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Window</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        {tentativeDate && (
                          <FormDescription>
                            Auto-calculated: {formatDeliveryWindow(currentWindow)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isDelivered && (
            <TabsContent value="closure">
              <Card>
                <CardHeader>
                  <CardTitle>Closure Details</CardTitle>
                  <CardDescription>Outcome summary and learnings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="delivered_outcome_summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivered Outcome Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What was actually delivered..."
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
                    name="outcome_vs_intent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcome vs Intent</FormLabel>
                        <Select 
                          onValueChange={(v) => field.onChange(v === 'none' ? null : v)} 
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select match level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Not assessed</SelectItem>
                            <SelectItem value="fully">Fully met</SelectItem>
                            <SelectItem value="partial">Partially met</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closure_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closure Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Learnings, retrospective notes..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/initiatives')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNew ? 'Create Initiative' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
