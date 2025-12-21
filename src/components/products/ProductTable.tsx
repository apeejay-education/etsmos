import { Product, ProductType, ProductLifecycle, PriorityLevel } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
}

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

export function ProductTable({ products, onEdit, onDelete, canEdit, isAdmin }: ProductTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Lifecycle</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Business Owner</TableHead>
            <TableHead>Tech Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            {canEdit && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
              <TableCell className="font-medium">
                <div>
                  <p>{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {product.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{typeLabels[product.product_type]}</TableCell>
              <TableCell>
                <Badge className={lifecycleColors[product.lifecycle_stage]}>
                  {product.lifecycle_stage}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[product.strategic_priority]}>
                  {product.strategic_priority}
                </Badge>
              </TableCell>
              <TableCell>{product.business_owner || '-'}</TableCell>
              <TableCell>{product.tech_owner || '-'}</TableCell>
              <TableCell>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(product.created_at), 'MMM d, yyyy')}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
