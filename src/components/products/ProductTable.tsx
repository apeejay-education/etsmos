import { Product, ProductType, ProductLifecycle, PriorityLevel } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { InlineEditCell } from '@/components/ui/inline-edit-cell';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string | boolean) => void;
  onManageLeads?: (product: Product) => void;
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

const typeOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'client', label: 'Client' },
  { value: 'rnd', label: 'R&D' },
];

const lifecycleOptions = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'build', label: 'Build' },
  { value: 'live', label: 'Live' },
  { value: 'scale', label: 'Scale' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'sunset', label: 'Sunset' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function ProductTable({ products, onEdit, onDelete, onUpdate, onManageLeads, canEdit, isAdmin }: ProductTableProps) {
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
            {(isAdmin || onManageLeads) && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
              <TableCell className="font-medium">
                <div>
                  <InlineEditCell
                    value={product.name}
                    onSave={(value) => onUpdate(product.id, 'name', value)}
                    canEdit={canEdit}
                  />
                  {product.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {product.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <InlineEditCell
                  value={product.product_type}
                  displayValue={typeLabels[product.product_type]}
                  onSave={(value) => onUpdate(product.id, 'product_type', value)}
                  type="select"
                  options={typeOptions}
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={product.lifecycle_stage}
                    displayValue={product.lifecycle_stage}
                    onSave={(value) => onUpdate(product.id, 'lifecycle_stage', value)}
                    type="select"
                    options={lifecycleOptions}
                    canEdit={canEdit}
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${lifecycleColors[product.lifecycle_stage]}`}
                  />
                ) : (
                  <Badge className={lifecycleColors[product.lifecycle_stage]}>
                    {product.lifecycle_stage}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={product.strategic_priority}
                    displayValue={product.strategic_priority}
                    onSave={(value) => onUpdate(product.id, 'strategic_priority', value)}
                    type="select"
                    options={priorityOptions}
                    canEdit={canEdit}
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${priorityColors[product.strategic_priority]}`}
                  />
                ) : (
                  <Badge className={priorityColors[product.strategic_priority]}>
                    {product.strategic_priority}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <InlineEditCell
                  value={product.business_owner || ''}
                  onSave={(value) => onUpdate(product.id, 'business_owner', value)}
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell>
                <InlineEditCell
                  value={product.tech_owner || ''}
                  onSave={(value) => onUpdate(product.id, 'tech_owner', value)}
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell>
                <Badge 
                  variant={product.is_active ? 'default' : 'secondary'}
                  className={canEdit ? 'cursor-pointer' : ''}
                  onClick={canEdit ? () => onUpdate(product.id, 'is_active', !product.is_active) : undefined}
                  title={canEdit ? 'Click to toggle' : undefined}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              {(isAdmin || onManageLeads) && (
                <TableCell>
                  <div className="flex gap-1">
                    {onManageLeads && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onManageLeads(product)}
                        title="Manage Product Leads"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
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
