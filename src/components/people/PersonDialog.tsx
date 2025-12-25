import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePeople, Person, PersonInsert } from '@/hooks/usePeople';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
}

// Zod validation schema with proper length constraints
const personSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').or(z.literal('')),
  department: z.string().max(100, 'Department must be less than 100 characters').or(z.literal('')),
  role_title: z.string().max(100, 'Role must be less than 100 characters').or(z.literal('')),
  is_active: z.boolean(),
  app_role: z.enum(['admin', 'manager', 'viewer']).optional(),
});

type FormData = z.infer<typeof personSchema>;

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

export function PersonDialog({ open, onOpenChange, person }: PersonDialogProps) {
  const { createPerson, updatePerson } = usePeople();
  const { isAdmin } = useAuth();
  const isEditing = !!person;
  
  // Fetch user role if person has a user_id
  const { role: currentUserRole, updateRole } = useUserRole(person?.user_id || null);
  const [selectedAppRole, setSelectedAppRole] = useState<AppRole | undefined>(undefined);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      full_name: '',
      email: '',
      department: '',
      role_title: '',
      is_active: true,
      app_role: undefined,
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
        app_role: currentUserRole || undefined,
      });
      setSelectedAppRole(currentUserRole || undefined);
    } else {
      reset({
        full_name: '',
        email: '',
        department: '',
        role_title: '',
        is_active: true,
        app_role: undefined,
      });
      setSelectedAppRole(undefined);
    }
  }, [person, currentUserRole, reset]);

  const onSubmit = async (data: FormData) => {
    const personData: PersonInsert = {
      full_name: data.full_name.trim(),
      email: data.email?.trim() || null,
      department: data.department?.trim() || null,
      role_title: data.role_title?.trim() || null,
      is_active: data.is_active,
    };

    if (isEditing && person) {
      await updatePerson.mutateAsync({ id: person.id, ...personData });
      
      // Update app role if changed and person has user_id
      if (person.user_id && selectedAppRole && selectedAppRole !== currentUserRole) {
        await updateRole.mutateAsync({ userId: person.user_id, role: selectedAppRole });
      }
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
              maxLength={200}
              {...register('full_name')}
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
              maxLength={255}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering, Product, Design"
              maxLength={100}
              {...register('department')}
            />
            {errors.department && (
              <p className="text-sm text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role_title">Role Title</Label>
            <Input
              id="role_title"
              placeholder="e.g., Senior Developer, Product Manager"
              maxLength={100}
              {...register('role_title')}
            />
            {errors.role_title && (
              <p className="text-sm text-destructive mt-1">{errors.role_title.message}</p>
            )}
          </div>

          {/* App Role - Only show for admins when editing a person with a user account */}
          {isAdmin && isEditing && person?.user_id && (
            <div>
              <Label htmlFor="app_role">System Role</Label>
              <Select 
                value={selectedAppRole} 
                onValueChange={(value) => setSelectedAppRole(value as AppRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Controls what this user can do in the system
              </p>
            </div>
          )}

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
            <Button type="submit" disabled={createPerson.isPending || updatePerson.isPending || updateRole.isPending}>
              {isEditing ? 'Update' : 'Add'} Person
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
