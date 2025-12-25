import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, FileText, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInitiative } from '@/hooks/useInitiatives';
import { useInitiativeAllocations } from '@/hooks/useInitiativeAllocations';
import { useInitiativeTasks } from '@/hooks/useInitiativeTasks';
import { useInitiativePermissions } from '@/hooks/useInitiativePermissions';
import { useProducts } from '@/hooks/useProducts';
import { InitiativeOverviewTab } from '@/components/initiatives/InitiativeOverviewTab';
import { InitiativeResourcesTab } from '@/components/initiatives/InitiativeResourcesTab';
import { InitiativeTasksPage } from '@/components/initiatives/InitiativeTasksPage';
import { InitiativeActivityTab } from '@/components/initiatives/InitiativeActivityTab';
import { InitiativeEditForm } from '@/components/initiatives/InitiativeEditForm';

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === 'new' || location.pathname.endsWith('/initiatives/new');
  
  const { data: initiative, isLoading: loadingInitiative } = useInitiative(isNew ? '' : (id ?? ''));
  const { data: products } = useProducts();
  const { allocations, isLoading: loadingAllocations } = useInitiativeAllocations(isNew ? undefined : id);
  const { tasks, taskMetrics, isLoading: loadingTasks } = useInitiativeTasks(isNew ? undefined : id);
  const permissions = useInitiativePermissions(isNew ? null : (id ?? null));
  
  // Default tab based on whether this is new or existing initiative
  const defaultTab = isNew ? 'edit' : 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isLoading = loadingInitiative || loadingAllocations || loadingTasks;

  if (isNew && !permissions.canCreateInitiative) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">You don’t have permission to create initiatives.</p>
          <Button variant="outline" onClick={() => navigate('/initiatives')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Initiatives
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading && !isNew) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!isNew && !initiative) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Initiative not found</p>
          <Button variant="outline" onClick={() => navigate('/initiatives')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Initiatives
          </Button>
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
      in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      blocked: 'bg-red-500/10 text-red-600 border-red-500/20',
      approved: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      dropped: 'bg-muted text-muted-foreground border-muted',
    };
    return (
      <Badge variant="outline" className={colors[status] || ''}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const totalResources = allocations?.length || 0;
  const totalTasks = taskMetrics?.totalTasks || 0;
  const completedTasks = taskMetrics?.completedTasks || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/initiatives')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? 'New Initiative' : initiative?.title}
              </h1>
              {!isNew && initiative && (
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(initiative.status)}
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{initiative.products?.name || 'No Product'}</span>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline" className="capitalize">{initiative.priority_level}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards - Only show for existing initiatives */}
        {!isNew && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalResources}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Tasks Done
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Target Window
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{initiative?.target_delivery_window}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Complexity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{initiative?.complexity || 'medium'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Blocked Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(taskMetrics?.blockedTasks || 0) > 0 ? 'text-destructive' : ''}`}>
                  {taskMetrics?.blockedTasks || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            {!isNew && (
              <>
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                {permissions.canViewTasks && (
                  <TabsTrigger value="tasks" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tasks ({totalTasks})
                  </TabsTrigger>
                )}
                {permissions.canViewResources && (
                  <TabsTrigger value="resources" className="gap-2">
                    <Users className="h-4 w-4" />
                    Resources ({totalResources})
                  </TabsTrigger>
                )}
                {permissions.canViewActivity && (
                  <TabsTrigger value="activity" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                )}
              </>
            )}
            {(permissions.canEditCore || (isNew && permissions.canCreateInitiative)) && (
              <TabsTrigger value="edit" className="gap-2">
                <Settings className="h-4 w-4" />
                {isNew ? 'Create' : 'Edit'}
              </TabsTrigger>
            )}
          </TabsList>

          {!isNew && initiative && (
            <>
              <TabsContent value="overview" className="space-y-6">
                <InitiativeOverviewTab 
                  initiative={initiative}
                  permissions={permissions}
                />
              </TabsContent>

              {permissions.canViewTasks && (
                <TabsContent value="tasks" className="space-y-6">
                  <InitiativeTasksPage
                    initiativeId={id!}
                    canManage={permissions.canManageTasks}
                    canUpdateOwn={permissions.canUpdateOwnTasks}
                  />
                </TabsContent>
              )}

              {permissions.canViewResources && (
                <TabsContent value="resources" className="space-y-6">
                  <InitiativeResourcesTab
                    initiativeId={id!}
                    initiative={initiative}
                    canAllocate={permissions.canAllocateResources}
                  />
                </TabsContent>
              )}

              {permissions.canViewActivity && (
                <TabsContent value="activity" className="space-y-6">
                  <InitiativeActivityTab
                    initiativeId={id!}
                    permissions={permissions}
                  />
                </TabsContent>
              )}
            </>
          )}

          {(permissions.canEditCore || (isNew && permissions.canCreateInitiative)) && (
            <TabsContent value="edit" className="space-y-6">
              <InitiativeEditForm
                initiative={isNew ? null : initiative!}
                products={products || []}
                isNew={isNew}
                onSuccess={() => {
                  if (isNew) {
                    navigate('/initiatives');
                  } else {
                    setActiveTab('overview');
                  }
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
