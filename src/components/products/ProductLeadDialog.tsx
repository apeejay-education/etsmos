import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { usePeople } from '@/hooks/usePeople';
import { useProductLeads } from '@/hooks/useProductLeads';

interface ProductLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ProductLeadDialog({ open, onOpenChange, productId, productName }: ProductLeadDialogProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const { people } = usePeople();
  const { productLeads, addProductLead, removeProductLead } = useProductLeads(productId);

  const currentLeadPersonIds = productLeads.map(pl => pl.person_id);
  const availablePeople = people.filter(p => p.is_active && !currentLeadPersonIds.includes(p.id));

  const handleAdd = async () => {
    if (!selectedPersonId) return;
    await addProductLead.mutateAsync({ productId, personId: selectedPersonId });
    setSelectedPersonId('');
  };

  const handleRemove = async (id: string) => {
    await removeProductLead.mutateAsync(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Product Leads - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Leads */}
          <div>
            <Label className="text-sm font-medium">Current Product Leads</Label>
            <div className="mt-2 space-y-2">
              {productLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No product leads assigned</p>
              ) : (
                productLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div>
                      <span className="font-medium">{lead.people?.full_name}</span>
                      {lead.people?.email && (
                        <span className="text-sm text-muted-foreground ml-2">{lead.people.email}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(lead.id)}
                      disabled={removeProductLead.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Lead */}
          <div className="space-y-2">
            <Label>Add Product Lead</Label>
            <div className="flex gap-2">
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAdd} 
                disabled={!selectedPersonId || addProductLead.isPending}
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Product leads can create and manage initiatives for this product
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
