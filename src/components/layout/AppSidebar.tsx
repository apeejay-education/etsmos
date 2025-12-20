import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Target, 
  Activity, 
  Settings,
  LogOut,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Initiatives', href: '/initiatives', icon: Target },
  { name: 'Execution Signals', href: '/signals', icon: Activity },
  { name: 'Monthly Snapshots', href: '/snapshots', icon: Calendar },
  { name: 'People', href: '/people', icon: Users },
];

const adminNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { user, userRole, signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold text-sidebar-foreground">Management OS</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
        
        {isAdmin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
      
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user?.email}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {userRole || 'Loading...'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-sidebar-foreground"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
