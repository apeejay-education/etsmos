import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useInitiative } from '@/hooks/useInitiatives';
import { useInitiativeAllocations } from '@/hooks/useInitiativeAllocations';
import { useInitiativeTasks } from '@/hooks/useInitiativeTasks';
import { useCapacitySettings } from '@/hooks/useCapacitySettings';
import { usePeople } from '@/hooks/usePeople';
import { ResourceTable } from '@/components/initiatives/ResourceTable';
import { TaskTable } from '@/components/initiatives/TaskTable';
import { AllocationSheet } from '@/components/initiatives/AllocationSheet';
import { TaskSheet } from '@/components/initiatives/TaskSheet';
import { useState } from 'react';

export default function InitiativeResources() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: initiative, isLoading: loadingInitiative } = useInitiative(id!);
  const { allocations, isLoading: loadingAllocations, createAllocation, updateAllocation, deleteAllocation } = useInitiativeAllocations(id);
  const { tasks, isLoading: loadingTasks, createTask, updateTask, deleteTask, taskMetrics } = useInitiativeTasks(id);
  const { settings, getRoleMultiplier, getComplexityMultiplier } = useCapacitySettings();
  const { people } = usePeople();

  const [allocationSheetOpen, setAllocationSheetOpen] = useState(false);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  if (loadingInitiative || loadingAllocations || loadingTasks) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-muted-foreground">Initiative not found</p>
      </div>
    );
  }

  // Calculate resource metrics
  const calculateEffectiveLoad = (hours: number, role: string) => {
    const roleMultiplier = getRoleMultiplier(role);
    const complexityMultiplier = getComplexityMultiplier(initiative.complexity || 'medium');
    return hours * roleMultiplier * complexityMultiplier;
  };

  const totalResources = allocations.length;
  const totalAllocatedHours = allocations.reduce((sum, a) => sum + a.allocated_hours_per_week, 0);
  const totalEffectiveLoad = allocations.reduce((sum, a) => sum + calculateEffectiveLoad(a.allocated_hours_per_week, a.role), 0);
  const avgUtilization = totalResources > 0 
    ? Math.round((totalEffectiveLoad / (totalResources * (settings?.weekly_capacity_hours || 40))) * 100)
    : 0;
  
  const overloadedCount = allocations.filter(a => {
    const load = calculateEffectiveLoad(a.allocated_hours_per_week, a.role);
    return (load / (settings?.weekly_capacity_hours || 40)) * 100 > 90;
  }).length;

  const underutilizedCount = allocations.filter(a => {
    const load = calculateEffectiveLoad(a.allocated_hours_per_week, a.role);
    return (load / (settings?.weekly_capacity_hours || 40)) * 100 < 30;
  }).length;

  // Get available people for allocation (not already allocated)
  const allocatedPersonIds = new Set(allocations.map(a => a.person_id));
  const availablePeople = people.filter(p => !allocatedPersonIds.has(p.id) && p.is_active);

  const handleEditAllocation = (allocationId: string) => {
    setEditingAllocation(allocationId);
    setAllocationSheetOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTask(taskId);
    setTaskSheetOpen(true);
  };

  const handleCloseAllocationSheet = () => {
    setAllocationSheetOpen(false);
    setEditingAllocation(null);
  };

  const handleCloseTaskSheet = () => {
    setTaskSheetOpen(false);
    setEditingTask(null);
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Delivered</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Blocked</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Approved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/initiatives')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{initiative.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getHealthBadge(initiative.status)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{initiative.products?.name || 'No Product'}</span>
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className="capitalize">{initiative.complexity} complexity</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Allocated Hours/wk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocatedHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgUtilization > 90 ? 'text-red-600' : avgUtilization > 70 ? 'text-amber-600' : 'text-green-600'}`}>
              {avgUtilization}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overloaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overloadedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overloadedCount}
            </div>
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
            <div className="text-2xl font-bold">
              {taskMetrics.completedTasks}/{taskMetrics.totalTasks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources ({totalResources})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({taskMetrics.totalTasks})</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAllocationSheetOpen(true)}>
              Add Resource
            </Button>
          </div>
          <ResourceTable
            allocations={allocations}
            tasks={tasks}
            settings={settings}
            initiative={initiative}
            onEdit={handleEditAllocation}
            onDelete={(id) => deleteAllocation.mutate(id)}
            getRoleMultiplier={getRoleMultiplier}
            getComplexityMultiplier={getComplexityMultiplier}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTaskSheetOpen(true)}>
              Add Task
            </Button>
          </div>
          <TaskTable
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={(id) => deleteTask.mutate(id)}
            onStatusChange={(id, status) => updateTask.mutate({ id, status })}
          />
        </TabsContent>
      </Tabs>

      {/* Allocation Sheet */}
      <AllocationSheet
        open={allocationSheetOpen}
        onClose={handleCloseAllocationSheet}
        initiativeId={id!}
        complexity={initiative.complexity || 'medium'}
        editingId={editingAllocation}
        allocations={allocations}
        availablePeople={availablePeople}
        allPeople={people}
        settings={settings}
        getRoleMultiplier={getRoleMultiplier}
        getComplexityMultiplier={getComplexityMultiplier}
        onCreate={(data) => createAllocation.mutate(data)}
        onUpdate={(data) => updateAllocation.mutate(data)}
      />

      {/* Task Sheet */}
      <TaskSheet
        open={taskSheetOpen}
        onClose={handleCloseTaskSheet}
        initiativeId={id!}
        editingId={editingTask}
        tasks={tasks}
        allocatedPeople={allocations.map(a => a.person!).filter(Boolean)}
        onCreate={(data) => createTask.mutate(data)}
        onUpdate={(data) => updateTask.mutate(data)}
      />
    </div>
  );
}
