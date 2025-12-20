import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePeople, Person, PersonInsert } from '@/hooks/usePeople';

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
}

interface FormData {
  full_name: string;
  email: string;
  department: string;
  role_title: string;
  is_active: boolean;
}

export function PersonDialog({ open, onOpenChange, person }: PersonDialogProps) {
  const { createPerson, updatePerson } = usePeople();
  const isEditing = !!person;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      full_name: '',
      email: '',
      department: '',
      role_title: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (person) {
      reset({
        full_name: person.full_name,
        email: person.email || '',
        department: person.department || '',
        role_title: person.role_title || '',
        is_active: person.is_active,
      });
    } else {
      reset({
        full_name: '',
        email: '',
        department: '',
        role_title: '',
        is_active: true,
      });
    }
  }, [person, reset]);

  const onSubmit = async (data: FormData) => {
    const personData: PersonInsert = {
      full_name: data.full_name,
      email: data.email || null,
      department: data.department || null,
      role_title: data.role_title || null,
      is_active: data.is_active,
    };

    if (isEditing && person) {
      await updatePerson.mutateAsync({ id: person.id, ...personData });
    } else {
      await createPerson.mutateAsync(personData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Person' : 'Add Person'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name', { required: 'Name is required' })}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering, Product, Design"
              {...register('department')}
            />
          </div>

          <div>
            <Label htmlFor="role_title">Role Title</Label>
            <Input
              id="role_title"
              placeholder="e.g., Senior Developer, Product Manager"
              {...register('role_title')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPerson.isPending || updatePerson.isPending}>
              {isEditing ? 'Update' : 'Add'} Person
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
