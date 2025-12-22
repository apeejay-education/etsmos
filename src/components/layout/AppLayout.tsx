import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppSidebar } from './AppSidebar';
import { PasswordResetPrompt } from '@/components/auth/PasswordResetPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  // Check if user needs to reset password
  const { data: personData } = useQuery({
    queryKey: ['current-person-reset', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('people')
        .select('id, must_reset_password')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const showResetPrompt = personData?.must_reset_password === true;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      
      {showResetPrompt && personData?.id && (
        <PasswordResetPrompt open={showResetPrompt} personId={personData.id} />
      )}
    </div>
  );
}
