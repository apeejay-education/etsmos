import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Target,
  Users,
  Package,
  Activity,
  Calendar,
  ClipboardList,
  Settings,
  UserCog,
  LayoutDashboard,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

const helpSections = [
  { id: 'overview', title: 'Getting Started', icon: BookOpen },
  { id: 'roles', title: 'User Roles & Permissions', icon: Users },
  { id: 'dashboard', title: 'Dashboard Guide', icon: LayoutDashboard },
  { id: 'products', title: 'Products', icon: Package },
  { id: 'initiatives', title: 'Initiatives', icon: Target },
  { id: 'delegation', title: 'Resource Allocation', icon: UserCog },
  { id: 'signals', title: 'Execution Signals', icon: Activity },
  { id: 'snapshots', title: 'Monthly Snapshots', icon: Calendar },
  { id: 'people', title: 'People Management', icon: Users },
  { id: 'audit', title: 'Audit Trail', icon: ClipboardList },
  { id: 'settings', title: 'Settings (Admin)', icon: Settings },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
];

export default function Help() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">
            Complete documentation for Apeejay ETS - Executive Tracking System
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <Card className="w-64 shrink-0 h-fit sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {helpSections.map((section) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-2 text-sm',
                      activeSection === section.id && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="flex-1">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <CardContent className="p-6">
                <HelpContent section={activeSection} />
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function HelpContent({ section }: { section: string }) {
  switch (section) {
    case 'overview':
      return <OverviewSection />;
    case 'roles':
      return <RolesSection />;
    case 'dashboard':
      return <DashboardSection />;
    case 'products':
      return <ProductsSection />;
    case 'initiatives':
      return <InitiativesSection />;
    case 'delegation':
      return <DelegationSection />;
    case 'signals':
      return <SignalsSection />;
    case 'snapshots':
      return <SnapshotsSection />;
    case 'people':
      return <PeopleSection />;
    case 'audit':
      return <AuditSection />;
    case 'settings':
      return <SettingsSection />;
    case 'faq':
      return <FAQSection />;
    default:
      return <OverviewSection />;
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold mb-4">{children}</h2>;
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="text-muted-foreground ml-6">{children}</div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Getting Started with Apeejay ETS</SectionTitle>
      
      <SubSection title="What is Apeejay ETS?">
        <p className="mb-3">
          Apeejay ETS (Executive Tracking System) is a comprehensive management operating system designed to track strategic initiatives from decision to delivery. It provides complete visibility into organizational execution across all products and teams.
        </p>
        <p>
          The system serves as the single source of truth for tracking what's approved, who's accountable, and how initiatives are progressing across the organization.
        </p>
      </SubSection>

      <SubSection title="Purpose & Vision">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Decision Tracking:</strong> Capture and track all approved initiatives with proper authorization chain</li>
          <li><strong>Execution Visibility:</strong> Real-time health signals and execution stage tracking</li>
          <li><strong>Resource Management:</strong> Allocate and track team capacity across initiatives</li>
          <li><strong>Outcome Focus:</strong> Track whether delivered outcomes match original intent</li>
          <li><strong>Accountability:</strong> Clear ownership and escalation paths for every initiative</li>
        </ul>
      </SubSection>

      <SubSection title="Key Features Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Products</h4>
            <p className="text-sm">Manage your product portfolio with lifecycle stages and ownership</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Initiatives</h4>
            <p className="text-sm">Track strategic projects from approval to delivery</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Resource Allocation</h4>
            <p className="text-sm">Assign team members and track workload distribution</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Execution Signals</h4>
            <p className="text-sm">Monitor health status and identify blockers early</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Dashboard</h4>
            <p className="text-sm">At-a-glance view of organizational execution health</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium">Audit Trail</h4>
            <p className="text-sm">Complete change history for compliance and review</p>
          </div>
        </div>
      </SubSection>

      <SubSection title="Quick Navigation">
        <p className="mb-2">Use the sidebar menu to navigate between sections:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Dashboard:</strong> Your home base with key metrics and alerts</li>
          <li><strong>Products:</strong> Manage your product portfolio</li>
          <li><strong>Initiatives:</strong> Create and track strategic initiatives</li>
          <li><strong>Delegation:</strong> View and manage resource workloads</li>
          <li><strong>Execution Signals:</strong> Monitor health across all initiatives</li>
          <li><strong>Monthly Snapshots:</strong> Record monthly progress summaries</li>
          <li><strong>People:</strong> Manage team members and contributions</li>
          <li><strong>Audit Trail:</strong> Review all system changes</li>
        </ul>
      </SubSection>
    </div>
  );
}

function RolesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>User Roles & Permissions</SectionTitle>
      
      <p className="text-muted-foreground mb-6">
        Apeejay ETS uses a role-based access control system with two types of roles: System Roles (what you can access in the application) and Initiative Roles (your responsibility on specific initiatives).
      </p>

      <SubSection title="System Roles">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg border-primary/30 bg-primary/5">
            <h4 className="font-semibold text-primary">Admin</h4>
            <p className="text-sm mb-2">Full system access with configuration capabilities</p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Create and manage all products and initiatives</li>
              <li>Manage user accounts and assign roles</li>
              <li>Access Settings for capacity configuration</li>
              <li>View and export audit logs</li>
              <li>Full CRUD access to all data</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg border-blue-500/30 bg-blue-500/5">
            <h4 className="font-semibold text-blue-600">Manager</h4>
            <p className="text-sm mb-2">Operational access for team leads and managers</p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Create and edit initiatives in assigned products</li>
              <li>Allocate resources and manage team assignments</li>
              <li>Update execution signals and health status</li>
              <li>View delegation and workload reports</li>
              <li>Cannot access system Settings</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg border-muted-foreground/30 bg-muted/20">
            <h4 className="font-semibold">Viewer</h4>
            <p className="text-sm mb-2">Read-only access for stakeholders and executives</p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>View dashboard and all reports</li>
              <li>See initiative details and status</li>
              <li>Access audit trail for transparency</li>
              <li>Cannot create or edit any data</li>
              <li>Sees simplified personal dashboard</li>
            </ul>
          </div>
        </div>
      </SubSection>

      <SubSection title="Initiative Roles">
        <p className="mb-3">These roles define a person's responsibility on specific initiatives:</p>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold">Lead</h4>
            <p className="text-sm text-muted-foreground">
              Primary accountable person for the initiative. Leads have a higher workload multiplier (1.2x by default) reflecting their additional responsibility for coordination, decision-making, and stakeholder management.
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold">Contributor</h4>
            <p className="text-sm text-muted-foreground">
              Active participant in initiative execution. Contributors have a standard workload multiplier (1.0x by default) and are responsible for completing assigned tasks and deliverables.
            </p>
          </div>
        </div>
      </SubSection>

      <SubSection title="Role Assignment">
        <ul className="list-disc list-inside space-y-2">
          <li>System roles (Admin, Manager, Viewer) are assigned by administrators in the People section</li>
          <li>Initiative roles (Lead, Contributor) are assigned when allocating resources to an initiative</li>
          <li>A person can have different initiative roles on different initiatives</li>
          <li>Product Leads can be designated for each product to indicate primary ownership</li>
        </ul>
      </SubSection>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Dashboard Guide</SectionTitle>
      
      <SubSection title="Management Dashboard">
        <p className="mb-3">
          The Management Dashboard (visible to Admins and Managers) provides a comprehensive overview of organizational execution health:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Today's Focus:</strong> Items requiring immediate attention - overdue tasks, blocked initiatives, new priorities</li>
          <li><strong>Delivery Trends:</strong> Chart showing initiative completion over time</li>
          <li><strong>Health Distribution:</strong> Pie chart showing green/amber/red status across initiatives</li>
          <li><strong>Active Alerts:</strong> Critical and warning alerts with navigation to affected initiatives</li>
        </ul>
      </SubSection>

      <SubSection title="Executive View">
        <p className="mb-3">
          A high-level summary designed for leadership review:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Overall Health Score:</strong> Aggregated health percentage across all active initiatives</li>
          <li><strong>Key Metrics:</strong> Total initiatives, active count, blocked count, delivered this month</li>
          <li><strong>Top Priorities:</strong> High-priority initiatives requiring attention</li>
          <li><strong>Risk Summary:</strong> Initiatives with red or amber health status</li>
        </ul>
      </SubSection>

      <SubSection title="Viewer Dashboard">
        <p className="mb-3">
          Users with Viewer role see a simplified personal dashboard showing:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Initiatives they're assigned to</li>
          <li>Tasks assigned to them</li>
          <li>Recent activity on their initiatives</li>
        </ul>
      </SubSection>

      <SubSection title="Understanding Stats">
        <div className="space-y-2">
          <p><strong>Active Initiatives:</strong> Initiatives with status "in_progress"</p>
          <p><strong>Blocked:</strong> Initiatives that need intervention to proceed</p>
          <p><strong>Health Status:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li><span className="text-green-600">Green:</span> On track, no issues</li>
            <li><span className="text-amber-600">Amber:</span> At risk, needs monitoring</li>
            <li><span className="text-red-600">Red:</span> Critical issues, needs immediate action</li>
          </ul>
        </div>
      </SubSection>
    </div>
  );
}

function ProductsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Products</SectionTitle>
      
      <SubSection title="What are Products?">
        <p>
          Products are the organizational containers for initiatives. They can represent actual products, services, departments, or any logical grouping of related initiatives. Every initiative must belong to a product.
        </p>
      </SubSection>

      <SubSection title="Product Types">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Internal:</strong> Products used within the organization</li>
          <li><strong>External:</strong> Customer-facing products</li>
          <li><strong>Client:</strong> Products developed for specific clients</li>
          <li><strong>R&D:</strong> Research and development projects</li>
        </ul>
      </SubSection>

      <SubSection title="Lifecycle Stages">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Ideation:</strong> Early conceptual stage</li>
          <li><strong>Build:</strong> Active development</li>
          <li><strong>Live:</strong> Deployed and operational</li>
          <li><strong>Scale:</strong> Growth and expansion phase</li>
          <li><strong>Maintenance:</strong> Stable with minimal changes</li>
          <li><strong>Sunset:</strong> Being phased out</li>
        </ul>
      </SubSection>

      <SubSection title="Creating Products">
        <ol className="list-decimal list-inside space-y-2">
          <li>Navigate to Products page</li>
          <li>Click "Add Product" button</li>
          <li>Fill in product name and description</li>
          <li>Select product type and lifecycle stage</li>
          <li>Set strategic priority (High/Medium/Low)</li>
          <li>Optionally assign Business Owner and Tech Owner</li>
          <li>Click Save</li>
        </ol>
      </SubSection>

      <SubSection title="Product Leads">
        <p className="mb-2">
          You can designate Product Leads - team members who have primary responsibility for a product. To manage leads:
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click on a product row to expand it</li>
          <li>Click "Manage Leads" button</li>
          <li>Select team members to add as Product Leads</li>
        </ol>
      </SubSection>
    </div>
  );
}

function InitiativesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Initiatives</SectionTitle>
      
      <SubSection title="What are Initiatives?">
        <p>
          Initiatives are the core tracking unit in Apeejay ETS. They represent approved strategic projects, tasks, or programs that need to be tracked from decision to delivery. Each initiative captures the full context of what was approved, who is responsible, and how it's progressing.
        </p>
      </SubSection>

      <SubSection title="Initiative Statuses">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Approved:</strong> Formally approved but not yet started</li>
          <li><strong>In Progress:</strong> Actively being worked on</li>
          <li><strong>Blocked:</strong> Cannot proceed due to external factors</li>
          <li><strong>Delivered:</strong> Successfully completed</li>
          <li><strong>Dropped:</strong> Cancelled or deprioritized</li>
        </ul>
      </SubSection>

      <SubSection title="Priority Levels">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>High:</strong> Critical initiatives requiring immediate focus</li>
          <li><strong>Medium:</strong> Important but not urgent</li>
          <li><strong>Low:</strong> Nice-to-have or long-term projects</li>
        </ul>
      </SubSection>

      <SubSection title="Creating Initiatives">
        <ol className="list-decimal list-inside space-y-2">
          <li>Navigate to Initiatives page</li>
          <li>Click "New Initiative" button</li>
          <li>Select the parent Product</li>
          <li>Enter title and context/description</li>
          <li>Set priority level and complexity</li>
          <li>Choose target delivery window</li>
          <li>Add approval information (source, authority, date)</li>
          <li>Assign accountable owner</li>
          <li>Click Save</li>
        </ol>
      </SubSection>

      <SubSection title="Initiative Details">
        <p className="mb-2">Click on any initiative to see its detail page with multiple tabs:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Overview:</strong> Key information and status updates</li>
          <li><strong>Tasks:</strong> Break down work into trackable tasks</li>
          <li><strong>Resources:</strong> Team members allocated to this initiative</li>
          <li><strong>History:</strong> Full change log of the initiative</li>
        </ul>
      </SubSection>

      <SubSection title="Delivery Windows">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Immediate:</strong> Within days</li>
          <li><strong>Month:</strong> Within the current month</li>
          <li><strong>Quarter:</strong> Within the current quarter</li>
          <li><strong>Flexible:</strong> No fixed deadline</li>
        </ul>
      </SubSection>

      <SubSection title="Managing Tasks">
        <p className="mb-2">Tasks help break down initiatives into actionable items:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open an initiative's detail page</li>
          <li>Go to the Tasks tab</li>
          <li>Click "Add Task" to create a new task</li>
          <li>Set title, description, assignee, priority, and due date</li>
          <li>Update task status as work progresses</li>
        </ol>
      </SubSection>
    </div>
  );
}

function DelegationSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Resource Allocation (Delegation)</SectionTitle>
      
      <SubSection title="Overview">
        <p>
          The Delegation page provides a comprehensive view of how work is distributed across your team. It shows workload utilization for each team member based on their initiative allocations.
        </p>
      </SubSection>

      <SubSection title="Allocating Resources">
        <ol className="list-decimal list-inside space-y-2">
          <li>Open an initiative's detail page</li>
          <li>Go to the Resources tab</li>
          <li>Click "Add Allocation" button</li>
          <li>Select a team member</li>
          <li>Choose their role (Lead or Contributor)</li>
          <li>Set hours per week allocated</li>
          <li>Define start date and optional end date</li>
          <li>Click Save</li>
        </ol>
      </SubSection>

      <SubSection title="Understanding Workload">
        <p className="mb-3">The system calculates effective workload using several factors:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Allocated Hours:</strong> Weekly hours assigned to each initiative</li>
          <li><strong>Role Multiplier:</strong> Lead (1.2x) accounts for coordination overhead; Contributor (1.0x) for standard work</li>
          <li><strong>Complexity Factor:</strong> High complexity initiatives have higher effective load</li>
          <li><strong>Weekly Capacity:</strong> Total available hours (default 40)</li>
        </ul>
      </SubSection>

      <SubSection title="Workload Categories">
        <ul className="list-disc list-inside space-y-2">
          <li><span className="text-green-600"><strong>Healthy (0-80%):</strong></span> Good balance, capacity for new work</li>
          <li><span className="text-amber-600"><strong>Warning (80-100%):</strong></span> Near capacity, monitor closely</li>
          <li><span className="text-red-600"><strong>Overloaded (100%+):</strong></span> Exceeds capacity, needs rebalancing</li>
        </ul>
      </SubSection>

      <SubSection title="Delegation Table">
        <p className="mb-2">The delegation page shows for each person:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Name and role title</li>
          <li>Number of active allocations</li>
          <li>Total allocated hours per week</li>
          <li>Effective load (with multipliers applied)</li>
          <li>Visual utilization bar</li>
          <li>List of assigned initiatives</li>
        </ul>
      </SubSection>
    </div>
  );
}

function SignalsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Execution Signals</SectionTitle>
      
      <SubSection title="What are Execution Signals?">
        <p>
          Execution Signals capture the real-time health and progress of initiatives. They provide visibility into whether initiatives are on track, at risk, or blocked - enabling proactive management intervention.
        </p>
      </SubSection>

      <SubSection title="Health Status">
        <ul className="list-disc list-inside space-y-2">
          <li><span className="text-green-600"><strong>Green:</strong></span> On track - proceeding as planned with no significant issues</li>
          <li><span className="text-amber-600"><strong>Amber:</strong></span> At risk - facing challenges that could impact delivery if not addressed</li>
          <li><span className="text-red-600"><strong>Red:</strong></span> Critical - significant blockers or issues requiring immediate attention</li>
        </ul>
      </SubSection>

      <SubSection title="Execution Stages">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Not Started:</strong> Approved but work hasn't begun</li>
          <li><strong>Active:</strong> Work is underway</li>
          <li><strong>Paused:</strong> Temporarily on hold</li>
          <li><strong>Completed:</strong> All work finished</li>
        </ul>
      </SubSection>

      <SubSection title="Signal Components">
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Risk/Blocker Summary:</strong> Description of current challenges</li>
          <li><strong>Next Expected Movement:</strong> What should happen next</li>
          <li><strong>Last Management Touch:</strong> When leadership last reviewed</li>
          <li><strong>JIRA Epics:</strong> Link to external tracking systems</li>
        </ul>
      </SubSection>

      <SubSection title="Updating Signals">
        <ol className="list-decimal list-inside space-y-2">
          <li>Navigate to Execution Signals page</li>
          <li>Find the initiative to update</li>
          <li>Click the edit icon or row</li>
          <li>Update health status, stage, and notes</li>
          <li>Click Save</li>
        </ol>
        <p className="mt-2 text-sm">
          Regular signal updates (weekly recommended) ensure accurate visibility for leadership and early warning of issues.
        </p>
      </SubSection>
    </div>
  );
}

function SnapshotsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Monthly Snapshots</SectionTitle>
      
      <SubSection title="Purpose">
        <p>
          Monthly Snapshots provide a structured way to capture progress summaries, key deliveries, blockers faced, and lessons learned at the end of each month. They serve as an organizational memory and help with retrospectives.
        </p>
      </SubSection>

      <SubSection title="Creating a Snapshot">
        <ol className="list-decimal list-inside space-y-2">
          <li>Navigate to Monthly Snapshots page</li>
          <li>Click "Add Snapshot" button</li>
          <li>Select the month/year</li>
          <li>Fill in each section:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Summary: Overall month overview</li>
              <li>Key Deliveries: What was completed</li>
              <li>Blockers Faced: Challenges encountered</li>
              <li>Lessons Learned: Insights for improvement</li>
              <li>Next Month Focus: Priorities ahead</li>
            </ul>
          </li>
          <li>Click Save</li>
        </ol>
      </SubSection>

      <SubSection title="Best Practices">
        <ul className="list-disc list-inside space-y-2">
          <li>Create snapshots at the end of each month</li>
          <li>Be specific about deliveries - reference initiative names</li>
          <li>Document blockers honestly for process improvement</li>
          <li>Share lessons learned across teams</li>
        </ul>
      </SubSection>
    </div>
  );
}

function PeopleSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>People Management</SectionTitle>
      
      <SubSection title="Overview">
        <p>
          The People section manages team members who can be assigned to initiatives. People records are separate from user accounts - a person can exist without having login access.
        </p>
      </SubSection>

      <SubSection title="Adding People">
        <ol className="list-decimal list-inside space-y-2">
          <li>Navigate to People page</li>
          <li>Click "Add Person" button</li>
          <li>Enter full name and email</li>
          <li>Set department and role title</li>
          <li>Choose whether to create a login account</li>
          <li>If creating login, select system role (Admin/Manager/Viewer)</li>
          <li>Click Save</li>
        </ol>
      </SubSection>

      <SubSection title="Contributions">
        <p className="mb-2">Track how people contribute to initiatives:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>View all initiatives a person is allocated to</li>
          <li>See their role on each initiative</li>
          <li>Add performance ratings and assessment notes</li>
          <li>Track contribution history over time</li>
        </ul>
      </SubSection>

      <SubSection title="Active vs Inactive">
        <p>
          People can be marked as inactive (e.g., when they leave the organization). Inactive people won't appear in allocation dropdowns but their historical data is preserved.
        </p>
      </SubSection>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Audit Trail</SectionTitle>
      
      <SubSection title="Purpose">
        <p>
          The Audit Trail provides a complete history of all changes made in the system. It supports compliance requirements, troubleshooting, and accountability by showing who changed what and when.
        </p>
      </SubSection>

      <SubSection title="What's Tracked">
        <ul className="list-disc list-inside space-y-2">
          <li>All initiative creates, updates, and deletes</li>
          <li>Product changes</li>
          <li>Execution signal updates</li>
          <li>Resource allocation changes</li>
          <li>People record modifications</li>
        </ul>
      </SubSection>

      <SubSection title="Using the Audit Trail">
        <ul className="list-disc list-inside space-y-2">
          <li>Filter by table name to see specific types of changes</li>
          <li>Filter by date range for time-based analysis</li>
          <li>Click on entries to see old and new values</li>
          <li>Export data for compliance reporting</li>
        </ul>
      </SubSection>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Settings (Admin Only)</SectionTitle>
      
      <SubSection title="Access">
        <p>
          The Settings page is only accessible to users with the Admin role. It contains system-wide configuration that affects all users.
        </p>
      </SubSection>

      <SubSection title="Capacity Configuration">
        <p className="mb-2">Configure the parameters used for workload calculations:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Weekly Working Hours:</strong> Standard capacity per person (default: 40)</li>
          <li><strong>Role Multipliers:</strong>
            <ul className="list-disc list-inside ml-6">
              <li>Lead multiplier (default: 1.2x) - higher due to coordination overhead</li>
              <li>Contributor multiplier (default: 1.0x) - standard work</li>
            </ul>
          </li>
          <li><strong>Complexity Multipliers:</strong>
            <ul className="list-disc list-inside ml-6">
              <li>Low (default: 0.8x)</li>
              <li>Medium (default: 1.0x)</li>
              <li>High (default: 1.3x)</li>
            </ul>
          </li>
        </ul>
      </SubSection>

      <SubSection title="Account Information">
        <p>
          View your account email, user ID, and assigned system role.
        </p>
      </SubSection>
    </div>
  );
}

function FAQSection() {
  return (
    <div className="space-y-6">
      <SectionTitle>Frequently Asked Questions</SectionTitle>
      
      <SubSection title="How do I reset my password?">
        <p>
          Contact your system administrator to reset your password. Administrators can trigger a password reset from the People section.
        </p>
      </SubSection>

      <SubSection title="Why can't I edit an initiative?">
        <p>
          You may have Viewer role which is read-only. Contact your administrator to upgrade your access if you need edit capabilities.
        </p>
      </SubSection>

      <SubSection title="How is workload calculated?">
        <p>
          Workload = (Allocated Hours × Role Multiplier × Complexity Multiplier) / Weekly Capacity × 100%
        </p>
        <p className="mt-2">
          For example: 20 hours × 1.2 (Lead) × 1.0 (Medium) / 40 hours = 60% utilization
        </p>
      </SubSection>

      <SubSection title="What's the difference between status and health?">
        <p>
          <strong>Status</strong> is the official workflow state (Approved, In Progress, Blocked, Delivered, Dropped).
        </p>
        <p className="mt-2">
          <strong>Health</strong> (Green/Amber/Red) is a subjective assessment of how well the initiative is progressing within its current status.
        </p>
      </SubSection>

      <SubSection title="How do I assign someone to an initiative?">
        <ol className="list-decimal list-inside space-y-1">
          <li>Open the initiative detail page</li>
          <li>Go to Resources tab</li>
          <li>Click "Add Allocation"</li>
          <li>Select person, role, and hours</li>
          <li>Save</li>
        </ol>
      </SubSection>

      <SubSection title="Can I export data?">
        <p>
          Yes, most tables support CSV export. Look for the export button in the table header or toolbar.
        </p>
      </SubSection>

      <SubSection title="Who can see confidential initiatives?">
        <p>
          Initiatives marked as "Confidential" sensitivity are visible only to assigned team members, Product Leads of the parent product, and Admins.
        </p>
      </SubSection>

      <SubSection title="How do I contact support?">
        <p>
          Contact your organization's IT department or system administrator for technical support with Apeejay ETS.
        </p>
      </SubSection>
    </div>
  );
}
