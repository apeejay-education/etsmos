import { Initiative, InitiativeStatus, PriorityLevel, SensitivityLevel, DeliveryWindow } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
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

interface InitiativeWithProduct extends Omit<Initiative, 'products'> {
  products?: { name: string } | null;
}

interface InitiativeTableProps {
  initiatives: InitiativeWithProduct[];
  onEdit: (initiative: InitiativeWithProduct) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
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

const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'dropped', label: 'Dropped' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const sensitivityOptions = [
  { value: 'confidential', label: 'Confidential' },
  { value: 'internal', label: 'Internal' },
  { value: 'routine', label: 'Routine' },
];

const windowOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'flexible', label: 'Flexible' },
];

const formatStatusLabel = (status: string) => status.replace('_', ' ');

export function InitiativeTable({ initiatives, onEdit, onDelete, onUpdate, canEdit, isAdmin }: InitiativeTableProps) {
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
            {isAdmin && <TableHead className="w-16">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {initiatives.map((initiative) => (
            <TableRow key={initiative.id}>
              <TableCell className="font-medium">
                <div>
                  <InlineEditCell
                    value={initiative.title}
                    onSave={(value) => onUpdate(initiative.id, 'title', value)}
                    canEdit={canEdit}
                  />
                  {initiative.context && (
                    <p className="text-xs text-muted-foreground truncate max-w-48">
                      {initiative.context}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{initiative.products?.name || '-'}</TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={initiative.status}
                    displayValue={formatStatusLabel(initiative.status)}
                    onSave={(value) => onUpdate(initiative.id, 'status', value)}
                    type="select"
                    options={statusOptions}
                    canEdit={canEdit}
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[initiative.status]}`}
                  />
                ) : (
                  <Badge className={statusColors[initiative.status]}>
                    {formatStatusLabel(initiative.status)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={initiative.priority_level}
                    displayValue={initiative.priority_level}
                    onSave={(value) => onUpdate(initiative.id, 'priority_level', value)}
                    type="select"
                    options={priorityOptions}
                    canEdit={canEdit}
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityColors[initiative.priority_level]}`}
                  />
                ) : (
                  <Badge className={priorityColors[initiative.priority_level]}>
                    {initiative.priority_level}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={initiative.sensitivity_level}
                    displayValue={initiative.sensitivity_level}
                    onSave={(value) => onUpdate(initiative.id, 'sensitivity_level', value)}
                    type="select"
                    options={sensitivityOptions}
                    canEdit={canEdit}
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${sensitivityColors[initiative.sensitivity_level]}`}
                  />
                ) : (
                  <Badge className={sensitivityColors[initiative.sensitivity_level]}>
                    {initiative.sensitivity_level}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <InlineEditCell
                  value={initiative.accountable_owner || ''}
                  onSave={(value) => onUpdate(initiative.id, 'accountable_owner', value)}
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell>
                {canEdit ? (
                  <InlineEditCell
                    value={initiative.target_delivery_window}
                    displayValue={initiative.target_delivery_window}
                    onSave={(value) => onUpdate(initiative.id, 'target_delivery_window', value)}
                    type="select"
                    options={windowOptions}
                    canEdit={canEdit}
                    className="capitalize"
                  />
                ) : (
                  <span className="capitalize">{initiative.target_delivery_window}</span>
                )}
              </TableCell>
              <TableCell className={`text-sm ${
                initiative.tentative_delivery_date && new Date(initiative.tentative_delivery_date) < new Date() && initiative.status !== 'delivered' && initiative.status !== 'dropped'
                  ? 'text-destructive font-medium'
                  : 'text-muted-foreground'
              }`}>
                <InlineEditCell
                  value={initiative.tentative_delivery_date || ''}
                  displayValue={initiative.tentative_delivery_date 
                    ? format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy')
                    : '-'
                  }
                  onSave={(value) => onUpdate(initiative.id, 'tentative_delivery_date', value)}
                  type="date"
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <InlineEditCell
                  value={initiative.approval_date || ''}
                  displayValue={initiative.approval_date 
                    ? format(new Date(initiative.approval_date), 'MMM d, yyyy')
                    : '-'
                  }
                  onSave={(value) => onUpdate(initiative.id, 'approval_date', value)}
                  type="date"
                  canEdit={canEdit}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <InlineEditCell
                  value={initiative.actual_delivery_date || ''}
                  displayValue={initiative.actual_delivery_date 
                    ? format(new Date(initiative.actual_delivery_date), 'MMM d, yyyy')
                    : '-'
                  }
                  onSave={(value) => onUpdate(initiative.id, 'actual_delivery_date', value)}
                  type="date"
                  canEdit={canEdit}
                />
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(initiative.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
