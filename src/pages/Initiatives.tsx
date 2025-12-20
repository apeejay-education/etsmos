import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInitiatives, useCreateInitiative, useUpdateInitiative, useDeleteInitiative } from '@/hooks/useInitiatives';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Filter, List, LayoutGrid, Upload } from 'lucide-react';
import { InitiativeDialog } from '@/components/initiatives/InitiativeDialog';
import { InitiativeKanban } from '@/components/initiatives/InitiativeKanban';
import { CSVImportDialog } from '@/components/import/CSVImportDialog';
import { Initiative, InitiativeStatus, PriorityLevel, SensitivityLevel, ApprovalSource, DeliveryWindow, StrategicCategory } from '@/types/database';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { SortButton, SortDirection, SortOption } from '@/components/filters/SortButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { differenceInDays } from 'date-fns';

const sortOptions: SortOption[] = [
  { label: 'Title', value: 'title' },
  { label: 'Priority', value: 'priority_level' },
  { label: 'Status', value: 'status' },
  { label: 'Created', value: 'created_at' },
];

export default function Initiatives() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: initiatives, isLoading } = useInitiatives();
  const { data: products } = useProducts();
  const { canEdit, isAdmin } = useAuth();
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();
  const deleteInitiative = useDeleteInitiative();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(searchParams.get('priority') || 'all');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>(searchParams.get('sensitivity') || 'all');
  const [agingFilter, setAgingFilter] = useState<boolean>(searchParams.get('aging') === 'true');
  const [silentFilter, setSilentFilter] = useState<boolean>(searchParams.get('silent') === 'true');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isImporting, setIsImporting] = useState(false);

  const validStatuses = ['approved', 'in_progress', 'blocked', 'delivered', 'dropped'];
  const validPriorities = ['high', 'medium', 'low'];
  const validSensitivities = ['confidential', 'internal', 'routine'];
  const validApprovalSources = ['board', 'chairman', 'management', 'internal'];
  const validDeliveryWindows = ['immediate', 'month', 'quarter', 'flexible'];
  const validStrategicCategories = ['revenue', 'compliance', 'operations', 'quality', 'brand'];

  const handleImportInitiatives = async (data: Record<string, string>[]): Promise<{ success: number; errors: string[] }> => {
    setIsImporting(true);
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      if (!row.title?.trim()) {
        errors.push(`Row ${rowNum}: Title is required`);
        continue;
      }

      if (!row.product_name?.trim()) {
        errors.push(`Row ${rowNum}: Product name is required`);
        continue;
      }

      // Find product by name
      const product = products?.find(p => p.name.toLowerCase() === row.product_name.toLowerCase().trim());
      if (!product) {
        errors.push(`Row ${rowNum}: Product "${row.product_name}" not found. Please create the product first.`);
        continue;
      }

      const status = row.status?.toLowerCase() || 'approved';
      const priority = row.priority_level?.toLowerCase() || 'medium';
      const sensitivity = row.sensitivity_level?.toLowerCase() || 'routine';
      const approvalSource = row.approval_source?.toLowerCase() || 'internal';
      const deliveryWindow = row.target_delivery_window?.toLowerCase() || 'flexible';
      const strategicCategory = row.strategic_category?.toLowerCase() || null;

      if (!validStatuses.includes(status)) {
        errors.push(`Row ${rowNum}: Invalid status "${row.status}". Must be one of: ${validStatuses.join(', ')}`);
        continue;
      }

      if (!validPriorities.includes(priority)) {
        errors.push(`Row ${rowNum}: Invalid priority_level "${row.priority_level}". Must be one of: ${validPriorities.join(', ')}`);
        continue;
      }

      if (!validSensitivities.includes(sensitivity)) {
        errors.push(`Row ${rowNum}: Invalid sensitivity_level "${row.sensitivity_level}". Must be one of: ${validSensitivities.join(', ')}`);
        continue;
      }

      if (!validApprovalSources.includes(approvalSource)) {
        errors.push(`Row ${rowNum}: Invalid approval_source "${row.approval_source}". Must be one of: ${validApprovalSources.join(', ')}`);
        continue;
      }

      if (!validDeliveryWindows.includes(deliveryWindow)) {
        errors.push(`Row ${rowNum}: Invalid target_delivery_window "${row.target_delivery_window}". Must be one of: ${validDeliveryWindows.join(', ')}`);
        continue;
      }

      if (strategicCategory && !validStrategicCategories.includes(strategicCategory)) {
        errors.push(`Row ${rowNum}: Invalid strategic_category "${row.strategic_category}". Must be one of: ${validStrategicCategories.join(', ')}`);
        continue;
      }

      const { error } = await supabase.from('initiatives').insert({
        title: row.title.trim(),
        product_id: product.id,
        context: row.context?.trim() || null,
        expected_outcome: row.expected_outcome?.trim() || null,
        approval_source: approvalSource as ApprovalSource,
        approval_date: row.approval_date || null,
        status: status as InitiativeStatus,
        priority_level: priority as PriorityLevel,
        sensitivity_level: sensitivity as SensitivityLevel,
        target_delivery_window: deliveryWindow as DeliveryWindow,
        strategic_category: strategicCategory as StrategicCategory | null,
        accountable_owner: row.accountable_owner?.trim() || null,
        escalation_owner: row.escalation_owner?.trim() || null
      });

      if (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
      } else {
        success++;
      }
    }

    setIsImporting(false);
    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      toast.success(`Imported ${success} initiative(s)`);
    }

    return { success, errors };
  };

  // Parse URL params on mount
  useEffect(() => {
    const status = searchParams.get('status');
    const sensitivity = searchParams.get('sensitivity');
    const aging = searchParams.get('aging');
    const silent = searchParams.get('silent');
    const searchQuery = searchParams.get('search');

    if (status) setStatusFilter(status);
    if (sensitivity) setSensitivityFilter(sensitivity);
    if (aging === 'true') setAgingFilter(true);
    if (silent === 'true') setSilentFilter(true);
    if (searchQuery) setSearch(searchQuery);
  }, [searchParams]);

  const handleCreate = (data: Omit<Initiative, 'id' | 'created_at' | 'updated_at' | 'products'>) => {
    createInitiative.mutate(data, {
      onSuccess: () => setDialogOpen(false)
    });
  };

  const handleUpdate = (data: Omit<Initiative, 'id' | 'created_at' | 'updated_at' | 'products'>) => {
    if (!editingInitiative) return;
    updateInitiative.mutate({ id: editingInitiative.id, ...data }, {
      onSuccess: () => {
        setEditingInitiative(null);
        setDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteInitiative.mutate(deleteId, {
      onSuccess: () => setDeleteId(null)
    });
  };

  const handleStatusChange = (id: string, newStatus: InitiativeStatus) => {
    updateInitiative.mutate({ id, status: newStatus });
  };

  const statusColors: Record<InitiativeStatus, string> = {
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-red-100 text-red-800',
    delivered: 'bg-green-100 text-green-800',
    dropped: 'bg-gray-100 text-gray-800'
  };

  const priorityColors: Record<PriorityLevel, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  };

  const sensitivityColors: Record<SensitivityLevel, string> = {
    confidential: 'bg-purple-100 text-purple-800',
    internal: 'bg-blue-100 text-blue-800',
    routine: 'bg-gray-100 text-gray-800'
  };

  const handleSort = (field: string, direction: SortDirection) => {
    setSortBy(direction ? field : null);
    setSortDirection(direction);
  };

  const filteredInitiatives = useMemo(() => {
    if (!initiatives) return [];
    
    let result = initiatives.filter((i) => {
      // Handle comma-separated status values
      if (statusFilter !== 'all') {
        const statuses = statusFilter.split(',');
        if (!statuses.includes(i.status)) return false;
      }
      if (priorityFilter !== 'all' && i.priority_level !== priorityFilter) return false;
      if (sensitivityFilter !== 'all' && i.sensitivity_level !== sensitivityFilter) return false;
      
      // Aging filter (14+ days)
      if (agingFilter) {
        const aging = differenceInDays(new Date(), new Date(i.approval_date || i.created_at));
        if (aging <= 14 || i.status === 'delivered' || i.status === 'dropped') return false;
      }
      
      // Silent filter - no activity in 14+ days (simplified - would need execution_signals data)
      if (silentFilter) {
        const aging = differenceInDays(new Date(), new Date(i.updated_at));
        if (aging <= 14 || i.status === 'delivered' || i.status === 'dropped') return false;
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !i.title.toLowerCase().includes(searchLower) &&
          !(i.context || '').toLowerCase().includes(searchLower) &&
          !(i.accountable_owner || '').toLowerCase().includes(searchLower) &&
          !(i.products?.name || '').toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });

    if (sortBy && sortDirection) {
      const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
      result = [...result].sort((a, b) => {
        if (sortBy === 'priority_level') {
          const aVal = priorityOrder[a.priority_level];
          const bVal = priorityOrder[b.priority_level];
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aVal = a[sortBy as keyof typeof a] as string;
        const bVal = b[sortBy as keyof typeof b] as string;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }

    return result;
  }, [initiatives, search, statusFilter, priorityFilter, sensitivityFilter, agingFilter, silentFilter, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSensitivityFilter('all');
    setAgingFilter(false);
    setSilentFilter(false);
    setSearchParams({});
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || sensitivityFilter !== 'all' || agingFilter || silentFilter || search;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Initiatives</h1>
            <p className="text-muted-foreground">
              Track approved work and decisions
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                disabled={!products?.length}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                onClick={() => { setEditingInitiative(null); setDialogOpen(true); }}
                disabled={!products?.length}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Initiative
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <SearchFilter
              value={search}
              onChange={setSearch}
              placeholder="Search initiatives..."
            />
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sensitivity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sensitivity</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
              {viewMode === 'list' && (
                <SortButton
                  options={sortOptions}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'kanban')}>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {!products?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                Create a product first before adding initiatives
              </p>
            </CardContent>
          </Card>
        ) : filteredInitiatives.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {initiatives?.length === 0 ? 'No initiatives found' : 'No initiatives match your filters'}
              </p>
              {canEdit && initiatives?.length === 0 && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Initiative
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          <InitiativeKanban
            initiatives={filteredInitiatives}
            onEdit={(initiative) => { setEditingInitiative(initiative); setDialogOpen(true); }}
            onDelete={(id) => setDeleteId(id)}
            onStatusChange={handleStatusChange}
            canEdit={canEdit}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="space-y-4">
            {filteredInitiatives.map((initiative) => {
              const aging = differenceInDays(
                new Date(), 
                new Date(initiative.approval_date || initiative.created_at)
              );
              
              return (
                <Card key={initiative.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{initiative.title}</h3>
                          {aging > 14 && initiative.status !== 'delivered' && initiative.status !== 'dropped' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              {aging} days
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {initiative.products?.name}
                        </p>
                        {initiative.context && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {initiative.context}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge className={statusColors[initiative.status]}>
                            {initiative.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={priorityColors[initiative.priority_level]}>
                            {initiative.priority_level}
                          </Badge>
                          <Badge className={sensitivityColors[initiative.sensitivity_level]}>
                            {initiative.sensitivity_level}
                          </Badge>
                          {initiative.approval_source && (
                            <Badge variant="outline">
                              {initiative.approval_source}
                            </Badge>
                          )}
                        </div>
                        {initiative.accountable_owner && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Owner: {initiative.accountable_owner}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 ml-4">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setEditingInitiative(initiative); setDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteId(initiative.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <InitiativeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initiative={editingInitiative}
          products={products || []}
          onSubmit={editingInitiative ? handleUpdate : handleCreate}
          isLoading={createInitiative.isPending || updateInitiative.isPending}
        />

        <CSVImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          title="Import Initiatives"
          description="Upload a CSV file to import multiple initiatives at once. The CSV should have columns: title, product_name (must match existing product), context, expected_outcome, approval_source, approval_date, status, priority_level, sensitivity_level, target_delivery_window, strategic_category, accountable_owner, escalation_owner."
          sampleCsvUrl="/samples/initiatives-sample.csv"
          sampleFileName="initiatives-sample.csv"
          onImport={handleImportInitiatives}
          isLoading={isImporting}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Initiative?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the initiative
                and any associated execution signals.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
