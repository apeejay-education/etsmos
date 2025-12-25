import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductLead {
  id: string;
  product_id: string;
  person_id: string;
  created_at: string;
  created_by: string | null;
  people?: {
    full_name: string;
    email: string | null;
  };
  products?: {
    name: string;
  };
}

export function useProductLeads(productId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product-leads', productId],
    queryFn: async () => {
      let query = supabase
        .from('product_leads')
        .select('*, people(full_name, email), products(name)')
        .order('created_at', { ascending: false });
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ProductLead[];
    }
  });

  const addProductLead = useMutation({
    mutationFn: async ({ productId, personId }: { productId: string; personId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('product_leads')
        .insert({
          product_id: productId,
          person_id: personId,
          created_by: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-leads'] });
      toast({ title: 'Success', description: 'Product lead assigned' });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast({ title: 'Error', description: 'This person is already a product lead', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  });

  const removeProductLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-leads'] });
      toast({ title: 'Success', description: 'Product lead removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    productLeads: query.data ?? [],
    isLoading: query.isLoading,
    addProductLead,
    removeProductLead
  };
}

// Hook to check if current user is a product lead for any product
export function useIsProductLead() {
  return useQuery({
    queryKey: ['is-product-lead'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isProductLead: false, productIds: [] };

      const { data: person } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!person) return { isProductLead: false, productIds: [] };

      const { data: leads } = await supabase
        .from('product_leads')
        .select('product_id')
        .eq('person_id', person.id);
      
      return {
        isProductLead: (leads?.length ?? 0) > 0,
        productIds: leads?.map(l => l.product_id) ?? []
      };
    }
  });
}
