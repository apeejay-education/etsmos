import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CapacitySettings {
  id: string;
  weekly_capacity_hours: number;
  role_multiplier_lead: number;
  role_multiplier_contributor: number;
  role_multiplier_reviewer: number;
  role_multiplier_advisor: number;
  complexity_low: number;
  complexity_medium: number;
  complexity_high: number;
  updated_at: string;
}

export type CapacitySettingsUpdate = Partial<Omit<CapacitySettings, 'id' | 'updated_at'>>;

export function useCapacitySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['capacity-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capacity_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      
      // Return default values if no settings exist
      if (!data) {
        return {
          id: '',
          weekly_capacity_hours: 40,
          role_multiplier_lead: 1.2,
          role_multiplier_contributor: 1.0,
          role_multiplier_reviewer: 0.6,
          role_multiplier_advisor: 0.3,
          complexity_low: 0.8,
          complexity_medium: 1.0,
          complexity_high: 1.3,
          updated_at: new Date().toISOString(),
        } as CapacitySettings;
      }
      
      return data as CapacitySettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: CapacitySettingsUpdate) => {
      // First get the current settings to get the ID
      const { data: current, error: fetchError } = await supabase
        .from('capacity_settings')
        .select('id')
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!current) {
        throw new Error('No capacity settings found');
      }
      
      const { data, error } = await supabase
        .from('capacity_settings')
        .update(updates)
        .eq('id', current.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-settings'] });
      queryClient.invalidateQueries({ queryKey: ['delegation'] });
      toast({ title: 'Success', description: 'Capacity settings updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Helper to get role multiplier by role name
  const getRoleMultiplier = (role: string): number => {
    if (!settings) return 1.0;
    switch (role) {
      case 'lead': return settings.role_multiplier_lead;
      case 'contributor': return settings.role_multiplier_contributor;
      case 'reviewer': return settings.role_multiplier_reviewer;
      case 'advisor': return settings.role_multiplier_advisor;
      default: return 1.0;
    }
  };

  // Helper to get complexity multiplier by complexity level
  const getComplexityMultiplier = (complexity: string): number => {
    if (!settings) return 1.0;
    switch (complexity) {
      case 'low': return settings.complexity_low;
      case 'medium': return settings.complexity_medium;
      case 'high': return settings.complexity_high;
      default: return 1.0;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    getRoleMultiplier,
    getComplexityMultiplier,
  };
}
