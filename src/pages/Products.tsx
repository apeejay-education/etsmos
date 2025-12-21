import { useState, useMemo } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Filter, Upload, Download, List, LayoutGrid } from 'lucide-react';
import { ProductDialog } from '@/components/products/ProductDialog';
import { ProductTable } from '@/components/products/ProductTable';
import { CSVImportDialog, DuplicateInfo } from '@/components/import/CSVImportDialog';
import { Product, ProductType, ProductLifecycle, PriorityLevel } from '@/types/database';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { SortButton, SortDirection, SortOption } from '@/components/filters/SortButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { exportProductsToCSV, PRODUCTS_SAMPLE_CSV } from '@/utils/csvExport';
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
import { useQueryClient } from '@tanstack/react-query';

const sortOptions: SortOption[] = [
  { label: 'Name', value: 'name' },
  { label: 'Priority', value: 'strategic_priority' },
  { label: 'Lifecycle', value: 'lifecycle_stage' },
  { label: 'Created', value: 'created_at' },
];

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { canEdit, isAdmin } = useAuth();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const validProductTypes = ['internal', 'external', 'client', 'rnd'];
  const validLifecycleStages = ['ideation', 'build', 'live', 'scale', 'maintenance', 'sunset'];
  const validPriorities = ['high', 'medium', 'low'];

  const checkDuplicates = async (data: Record<string, string>[]): Promise<DuplicateInfo[]> => {
    const duplicates: DuplicateInfo[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const name = row.name?.trim().toLowerCase();
      
      if (name) {
        const existing = products?.find(p => p.name.toLowerCase() === name);
        if (existing) {
          duplicates.push({
            rowNum: i + 2,
            identifier: row.name,
            existingId: existing.id
          });
        }
      }
    }
    
    return duplicates;
  };

  const handleImportProducts = async (data: Record<string, string>[], skipDuplicates: boolean): Promise<{ success: number; errors: string[] }> => {
    setIsImporting(true);
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      if (!row.name?.trim()) {
        errors.push(`Row ${rowNum}: Name is required`);
        continue;
      }

      // Check for duplicate
      if (skipDuplicates) {
        const existing = products?.find(p => p.name.toLowerCase() === row.name.trim().toLowerCase());
        if (existing) {
          continue; // Skip this row
        }
      }

      const productType = row.product_type?.toLowerCase() || 'internal';
      const lifecycleStage = row.lifecycle_stage?.toLowerCase() || 'ideation';
      const priority = row.strategic_priority?.toLowerCase() || 'medium';

      if (!validProductTypes.includes(productType)) {
        errors.push(`Row ${rowNum}: Invalid product_type "${row.product_type}". Must be one of: ${validProductTypes.join(', ')}`);
        continue;
      }

      if (!validLifecycleStages.includes(lifecycleStage)) {
        errors.push(`Row ${rowNum}: Invalid lifecycle_stage "${row.lifecycle_stage}". Must be one of: ${validLifecycleStages.join(', ')}`);
        continue;
      }

      if (!validPriorities.includes(priority)) {
        errors.push(`Row ${rowNum}: Invalid strategic_priority "${row.strategic_priority}". Must be one of: ${validPriorities.join(', ')}`);
        continue;
      }

      const { error } = await supabase.from('products').insert({
        name: row.name.trim(),
        description: row.description?.trim() || null,
        product_type: productType as ProductType,
        lifecycle_stage: lifecycleStage as ProductLifecycle,
        strategic_priority: priority as PriorityLevel,
        business_owner: row.business_owner?.trim() || null,
        tech_owner: row.tech_owner?.trim() || null,
        is_active: true
      });

      if (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
      } else {
        success++;
      }
    }

    setIsImporting(false);
    if (success > 0) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Imported ${success} product(s)`);
    }

    return { success, errors };
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
      toast.error('No products to export');
      return;
    }
    exportProductsToCSV(products);
    toast.success(`Exported ${products.length} product(s)`);
  };

  const handleCreate = (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    createProduct.mutate(data, {
      onSuccess: () => setDialogOpen(false)
    });
  };

  const handleUpdate = (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProduct) return;
    updateProduct.mutate({ id: editingProduct.id, ...data }, {
      onSuccess: () => {
        setEditingProduct(null);
        setDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => setDeleteId(null)
    });
  };

  const handleSort = (field: string, direction: SortDirection) => {
    setSortBy(direction ? field : null);
    setSortDirection(direction);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products.filter((p) => {
      if (lifecycleFilter !== 'all' && p.lifecycle_stage !== lifecycleFilter) return false;
      if (priorityFilter !== 'all' && p.strategic_priority !== priorityFilter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(searchLower) &&
          !(p.description || '').toLowerCase().includes(searchLower) &&
          !(p.business_owner || '').toLowerCase().includes(searchLower) &&
          !(p.tech_owner || '').toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });

    if (sortBy && sortDirection) {
      const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
      result = [...result].sort((a, b) => {
        let aVal: string | number = a[sortBy as keyof typeof a] as string;
        let bVal: string | number = b[sortBy as keyof typeof b] as string;
        
        if (sortBy === 'strategic_priority') {
          aVal = priorityOrder[a.strategic_priority];
          bVal = priorityOrder[b.strategic_priority];
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }

    return result;
  }, [products, search, lifecycleFilter, priorityFilter, sortBy, sortDirection]);

  const lifecycleColors: Record<ProductLifecycle, string> = {
    ideation: 'bg-purple-100 text-purple-800',
    build: 'bg-blue-100 text-blue-800',
    live: 'bg-green-100 text-green-800',
    scale: 'bg-teal-100 text-teal-800',
    maintenance: 'bg-orange-100 text-orange-800',
    sunset: 'bg-gray-100 text-gray-800'
  };

  const priorityColors: Record<PriorityLevel, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  };

  const typeLabels: Record<ProductType, string> = {
    internal: 'Internal',
    external: 'External',
    client: 'Client',
    rnd: 'R&D'
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded" />
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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product portfolio
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!products?.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            {canEdit && (
              <>
                <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <SearchFilter
              value={search}
              onChange={setSearch}
              placeholder="Search products..."
            />
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Lifecycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="ideation">Ideation</SelectItem>
                  <SelectItem value="build">Build</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <SortButton
                options={sortOptions}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'card' | 'table')}>
            <ToggleGroupItem value="card" aria-label="Card view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {products?.length === 0 ? 'No products yet' : 'No products match your filters'}
              </p>
              {canEdit && products?.length === 0 && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'table' ? (
          <ProductTable
            products={filteredProducts}
            onEdit={(product) => { setEditingProduct(product); setDialogOpen(true); }}
            onDelete={(id) => setDeleteId(id)}
            onUpdate={(id, field, value) => updateProduct.mutate({ id, [field]: value })}
            canEdit={canEdit}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{typeLabels[product.product_type]}</CardDescription>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingProduct(product); setDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={lifecycleColors[product.lifecycle_stage]}>
                      {product.lifecycle_stage}
                    </Badge>
                    <Badge className={priorityColors[product.strategic_priority]}>
                      {product.strategic_priority} priority
                    </Badge>
                    {!product.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {product.business_owner && (
                      <p>Business: {product.business_owner}</p>
                    )}
                    {product.tech_owner && (
                      <p>Tech: {product.tech_owner}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          isLoading={createProduct.isPending || updateProduct.isPending}
        />

        <CSVImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          title="Import Products"
          description="Upload a CSV file to import multiple products at once. The CSV should have columns: name, description, product_type, lifecycle_stage, strategic_priority, business_owner, tech_owner."
          sampleCsvContent={PRODUCTS_SAMPLE_CSV}
          sampleFileName="products-sample.csv"
          onImport={handleImportProducts}
          checkDuplicates={checkDuplicates}
          isLoading={isImporting}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
                Note: Products with linked initiatives cannot be deleted.
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
