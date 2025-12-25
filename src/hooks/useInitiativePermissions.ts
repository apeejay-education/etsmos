import { useAuth } from '@/contexts/AuthContext';
import { useCurrentPersonContribution } from '@/hooks/useInitiativeAccess';
import { useIsProductLead } from '@/hooks/useProductLeads';

export type ContributionRole = 'lead' | 'contributor';

export interface InitiativePermissions {
  // View permissions - everyone tagged can view
  canView: boolean;
  canViewTasks: boolean;
  canViewResources: boolean;
  
  // Edit permissions - Admin and Lead only
  canEditCore: boolean;
  canEditInitiative: boolean;
  canCreateInitiative: boolean;
  
  // Task permissions
  canManageTasks: boolean;        // Admin, Manager & Lead can create/assign/delete tasks
  canUpdateOwnTasks: boolean;     // Contributor can update their own tasks
  
  // Resource permissions - Admin, Manager & Lead
  canAllocateResources: boolean;
  canSeeHistory: boolean;
  
  // Role info
  role: ContributionRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isLead: boolean;
  isContributor: boolean;
  isTagged: boolean;
  isProductLead: boolean;
}

/**
 * Hook to determine user permissions for a specific initiative based on:
 * - Global role (admin, manager, viewer)
 * - Contribution role on the initiative (lead, contributor)
 * - Product lead status (can create initiatives for their products)
 * 
 * Permission Matrix (Simplified):
 * | Role         | View | Edit Core | Allocate | Manage Tasks | Update Own Tasks | Create |
 * |--------------|------|-----------|----------|--------------|------------------|--------|
 * | Admin        | ✅   | ✅        | ✅       | ✅           | ✅               | ✅     |
 * | Manager      | ✅   | ✅        | ✅       | ✅           | ✅               | ✅     |
 * | Product Lead | ✅   | ✅ (own)  | ✅       | ✅           | ✅               | ✅     |
 * | Lead         | ✅   | ✅ (own)  | ✅       | ✅           | ✅               | ❌     |
 * | Contributor  | ✅   | ❌        | ❌       | ❌           | ✅               | ❌     |
 */
export function useInitiativePermissions(initiativeId: string | null): InitiativePermissions {
  const { userRole, canEdit: globalCanEdit } = useAuth();
  const { data: personData } = useCurrentPersonContribution(initiativeId);
  const { data: productLeadData } = useIsProductLead();
  
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isAdminOrManager = isAdmin || isManager;
  const isProductLead = productLeadData?.isProductLead ?? false;
  
  const contributionRole = personData?.contributionRole as ContributionRole | null;
  const isTagged = personData?.isTagged ?? false;
  
  const isLead = contributionRole === 'lead';
  const isContributor = contributionRole === 'contributor';
  
  // Can create new initiatives
  const canCreateInitiative = isAdminOrManager || isProductLead;
  
  // Admin, Manager, and Lead have full access
  const hasFullAccess = isAdminOrManager || isLead;
  
  return {
    // View - everyone with access can view
    canView: isAdminOrManager || isTagged,
    canViewTasks: isAdminOrManager || isTagged,
    canViewResources: isAdminOrManager || isTagged,
    
    // Edit core details - admin, manager, or lead
    canEditCore: hasFullAccess,
    canEditInitiative: globalCanEdit || isLead,
    canCreateInitiative,
    
    // Task management - Admin, Manager & Lead can fully manage
    canManageTasks: hasFullAccess,
    // Contributors can only update their own tasks
    canUpdateOwnTasks: isContributor,
    
    // Resource allocation - Admin, Manager & Lead
    canAllocateResources: hasFullAccess,
    canSeeHistory: hasFullAccess,
    
    // Role info
    role: contributionRole,
    isAdmin,
    isManager,
    isLead,
    isContributor,
    isTagged,
    isProductLead,
  };
}
