import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'manager';
}

/**
 * ProtectedRoute - UI-Only Access Guard
 * 
 * SECURITY NOTE: This component provides UI-level access control ONLY.
 * It is NOT a security boundary. All actual data security is enforced
 * server-side through Row Level Security (RLS) policies in the database.
 * 
 * This guard exists to:
 * 1. Provide a better user experience by preventing navigation to unauthorized pages
 * 2. Hide UI elements that users cannot interact with
 * 
 * Even if bypassed, RLS policies will prevent unauthorized data access:
 * - products, initiatives, execution_signals: Managers+ can create/update, admins can delete
 * - people: Managers+ can view/create/update, admins can delete
 * - monthly_snapshots: All authenticated can view, managers+ can modify
 * - user_roles: Users can view own roles, admins can manage all
 * - profiles: Users can view/update own, admins can view all
 * - audit_logs: Managers+ can view
 * - contributions: All can view, managers+ can modify, admins can delete
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // NOTE: This is a UI-only check. RLS enforces actual security.
  if (requiredRole) {
    const roleHierarchy = { admin: 3, manager: 2, viewer: 1 };
    const userLevel = roleHierarchy[userRole || 'viewer'];
    const requiredLevel = roleHierarchy[requiredRole];
    
    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
