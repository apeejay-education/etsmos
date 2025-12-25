import { useAuth } from '@/contexts/AuthContext';
import { useCurrentPersonContribution } from '@/hooks/useInitiativeAccess';
import { useIsProductLead } from '@/hooks/useProductLeads';

export type ContributionRole = 'lead' | 'contributor' | 'reviewer' | 'advisor';

export interface InitiativePermissions {
  // View permissions
  canView: boolean;
  canViewOverview: boolean;
  canViewTasks: boolean;
  canViewResources: boolean;
  canViewActivity: boolean;
  
  // Edit permissions
  canEditCore: boolean;
  canEditInitiative: boolean;
  canCreateInitiative: boolean;
  
  // Task permissions
  canManageTasks: boolean;
  canUpdateOwnTasks: boolean;
  
  // Resource permissions
  canAllocateResources: boolean;
  
  // Update/Review permissions
  canAddUpdates: boolean;
  canAddReviews: boolean;
  canAddComments: boolean;
  canSeeHistory: boolean;
  
  // Role info
  role: ContributionRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isLead: boolean;
  isContributor: boolean;
  isReviewer: boolean;
  isAdvisor: boolean;
  isTagged: boolean;
  isProductLead: boolean;
}

/**
 * Hook to determine user permissions for a specific initiative based on:
 * - Global role (admin, manager, viewer)
 * - Contribution role on the initiative (lead, contributor, reviewer, advisor)
 * - Product lead status (can create initiatives for their products)
 * 
 * Permission Matrix:
 * | Role         | View | Edit Core | Allocate | Manage Tasks | Review | Comment | Create |
 * |--------------|------|-----------|----------|--------------|--------|---------|--------|
 * | Admin        | ✅   | ✅        | ✅       | ✅           | ✅     | ✅      | ✅     |
 * | Manager      | ✅   | ✅        | ✅       | ✅           | ✅     | ✅      | ✅     |
 * | Product Lead | ✅   | ✅ (own)  | ✅       | ✅           | ✅     | ✅      | ✅     |
 * | Lead         | ✅   | ✅ (own)  | ✅       | ✅           | ✅     | ✅      | ❌     |
 * | Contributor  | ✅   | ❌        | ❌       | Update own   | ❌     | ✅      | ❌     |
 * | Reviewer     | ✅   | ❌        | ❌       | ❌           | ✅     | ✅      | ❌     |
 * | Advisor      | ✅   | ❌        | ❌       | ❌           | ❌     | ✅      | ❌     |
 */
export function useInitiativePermissions(initiativeId: string | null): InitiativePermissions {
  const { userRole, canEdit: globalCanEdit } = useAuth();
  const { data: personData, isLoading } = useCurrentPersonContribution(initiativeId);
  const { data: productLeadData } = useIsProductLead();
  
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isAdminOrManager = isAdmin || isManager;
  const isProductLead = productLeadData?.isProductLead ?? false;
  
  const contributionRole = personData?.contributionRole as ContributionRole | null;
  const isTagged = personData?.isTagged ?? false;
  
  const isLead = contributionRole === 'lead';
  const isContributor = contributionRole === 'contributor';
  const isReviewer = contributionRole === 'reviewer';
  const isAdvisor = contributionRole === 'advisor';
  
  // Can create new initiatives
  const canCreateInitiative = isAdminOrManager || isProductLead;
  
  return {
    // View - everyone with access can view
    canView: isAdminOrManager || isTagged,
    canViewOverview: isAdminOrManager || isTagged,
    canViewTasks: isAdminOrManager || isLead || isContributor || isReviewer,
    canViewResources: isAdminOrManager || isLead || isContributor || isReviewer || isAdvisor,
    canViewActivity: isAdminOrManager || isTagged,
    
    // Edit core details - admin, manager, or lead
    canEditCore: isAdminOrManager || isLead,
    canEditInitiative: globalCanEdit || isLead,
    canCreateInitiative,
    
    // Task management
    canManageTasks: isAdminOrManager || isLead,
    canUpdateOwnTasks: isContributor,
    
    // Resource allocation
    canAllocateResources: isAdminOrManager || isLead,
    
    // Updates, reviews, comments
    canAddUpdates: isAdminOrManager || isLead || isContributor,
    canAddReviews: isAdminOrManager || isLead || isReviewer,
    canAddComments: isAdminOrManager || isTagged,
    canSeeHistory: isAdminOrManager || isLead,
    
    // Role info
    role: contributionRole,
    isAdmin,
    isManager,
    isLead,
    isContributor,
    isReviewer,
    isAdvisor,
    isTagged,
    isProductLead,
  };
}
