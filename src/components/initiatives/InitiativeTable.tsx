import { Initiative, InitiativeStatus, PriorityLevel, SensitivityLevel } from '@/types/database';
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

interface InitiativeWithProduct extends Omit<Initiative, 'products'> {
  products?: { name: string } | null;
}

interface InitiativeTableProps {
  initiatives: InitiativeWithProduct[];
  onEdit: (initiative: InitiativeWithProduct) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
}

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

export function InitiativeTable({ initiatives, onEdit, onDelete, canEdit, isAdmin }: InitiativeTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Sensitivity</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Target Window</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead>Approval Date</TableHead>
            <TableHead>Delivery Date</TableHead>
            {canEdit && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {initiatives.map((initiative) => (
            <TableRow key={initiative.id}>
              <TableCell className="font-medium">
                <div>
                  <p>{initiative.title}</p>
                  {initiative.context && (
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {initiative.context}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{initiative.products?.name || '-'}</TableCell>
              <TableCell>
                <Badge className={statusColors[initiative.status]}>
                  {initiative.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[initiative.priority_level]}>
                  {initiative.priority_level}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={sensitivityColors[initiative.sensitivity_level]}>
                  {initiative.sensitivity_level}
                </Badge>
              </TableCell>
              <TableCell>{initiative.accountable_owner || '-'}</TableCell>
              <TableCell className="capitalize">{initiative.target_delivery_window}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {initiative.tentative_delivery_date 
                  ? format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy')
                  : '-'
                }
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {initiative.approval_date 
                  ? format(new Date(initiative.approval_date), 'MMM d, yyyy')
                  : '-'
                }
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {initiative.actual_delivery_date 
                  ? format(new Date(initiative.actual_delivery_date), 'MMM d, yyyy')
                  : '-'
                }
              </TableCell>
              {canEdit && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(initiative)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(initiative.id)}
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
