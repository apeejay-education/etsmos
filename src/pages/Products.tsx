import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ProductDialog } from '@/components/products/ProductDialog';
import { Product, ProductType, ProductLifecycle, PriorityLevel } from '@/types/database';
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

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { canEdit, isAdmin } = useAuth();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
          {canEdit && (
            <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        {products?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No products yet</p>
              {canEdit && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
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
