# ETS Management OS

**Enterprise Tracking System for Strategic Initiative Management**

A comprehensive Management Operating System designed for educational institutions and enterprises to track strategic initiatives, manage execution signals, and drive organizational excellence.

![Apeejay Education](src/assets/apeejay-logo.png)

## 🎯 Business Purpose

ETS Management OS addresses the critical need for **strategic execution visibility** in large organizations. Unlike task management tools (Jira, Asana), this system provides management-level intelligence on:

- **Strategic Initiative Lifecycle** - From board approval to delivery outcomes
- **Execution Health Monitoring** - Real-time signals on initiative progress
- **Performance Intelligence** - Individual and team contribution tracking
- **Governance & Compliance** - Complete audit trail for regulatory requirements

### Problem Solved

Traditional project management tools focus on operational tasks, leaving leadership blind to strategic execution. ETS bridges this gap by creating a "decision-to-outcome intelligence layer" that:

✅ **Tracks strategic intent vs actual outcomes**  
✅ **Detects silent initiatives** (approved but not progressing)  
✅ **Provides executive-grade dashboards** with actionable insights  
✅ **Maintains compliance audit trails** for governance requirements  
✅ **Links individual performance to strategic outcomes**

## 🏗️ Core Features

### 📋 Strategic Initiative Management
- Multi-source approval workflows (Board, Chairman, Management)
- Priority and sensitivity classification
- Delivery window tracking (Immediate, Monthly, Quarterly)
- Outcome assessment against original intent

### 📊 Execution Intelligence Dashboard
- Real-time health indicators (Green/Amber/Red)
- Aging initiative alerts
- Silent initiative detection
- Performance trend analytics

### 👥 People & Contribution Tracking
- Individual contribution linking to initiatives
- Performance assessment workflows
- Department and role-based organization
- Contribution intelligence (value, not time)

### 📈 Product Portfolio Management
- Product lifecycle tracking (Ideation → Sunset)
- Strategic priority alignment
- Business and technical ownership
- Initiative-to-product mapping

### 📅 Monthly Delivery Reviews
- Structured monthly snapshots
- Key deliveries and blockers documentation
- Lessons learned capture
- Strategic focus planning

### 🔍 Comprehensive Audit Trail
- Complete change tracking across all entities
- User attribution for all modifications
- Compliance-ready audit logs
- Advanced filtering and search

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query
- **Analytics**: Recharts for data visualization
- **Security**: Row-level security (RLS) + Role-based access

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd etsmos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Configuration

Create `.env.local` with your Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 👤 User Roles & Permissions

- **Admin**: Full system access, user management, all CRUD operations
- **Manager**: Create/edit initiatives, products, people; view all reports
- **Viewer**: Read-only access to dashboards and reports

*First registered user automatically receives Admin role*

## 📱 Key User Workflows

### For Executives
1. **Strategic Overview**: Monitor initiative health and delivery trends
2. **Risk Management**: Review aging and blocked initiatives
3. **Performance Review**: Assess team contributions and outcomes
4. **Compliance**: Access audit trails for governance requirements

### For Program Managers
1. **Initiative Setup**: Create initiatives linked to products
2. **Execution Tracking**: Update health signals and blockers
3. **Team Management**: Assign contributors and track performance
4. **Monthly Reviews**: Document deliveries and lessons learned

### For Team Members
1. **Contribution Tracking**: View assigned initiatives and roles
2. **Status Updates**: Update execution signals and progress
3. **Performance Data**: Access contribution summaries and assessments

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation

# BMad Method Integration
npm run bmad:refresh # Refresh BMad agents
npm run bmad:list    # List available agents
npm run bmad:validate # Validate BMad configuration
```

### Database Management

The system uses Supabase for backend services with automatic migrations. Key tables:

- `products` - Product registry and lifecycle
- `initiatives` - Strategic initiative tracking
- `execution_signals` - Real-time health monitoring
- `people` - Team member registry
- `contributions` - People-initiative relationships
- `monthly_snapshots` - Delivery reviews
- `audit_logs` - Complete change tracking

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme adaptation
- **Accessibility**: WCAG 2.1 compliant components
- **Real-time Updates**: Live data synchronization
- **Inline Editing**: Quick data entry and updates
- **Advanced Filtering**: Multi-criteria search and sort

## 📊 Business Intelligence Features

### Dashboard Analytics
- Delivery trend analysis (6-month historical)
- Health status distribution
- Contribution activity metrics
- Performance benchmarking

### Automated Alerting
- Critical/Warning severity levels
- Aging initiative detection
- Silent initiative identification
- Health status change notifications

### Reporting Capabilities
- Executive summary dashboards
- Monthly delivery snapshots
- Individual performance reports
- Audit compliance reports

## 🔐 Security & Compliance

- **Authentication**: Secure email/password with Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Data Security**: Row-level security (RLS) policies
- **Audit Trail**: Complete change logging for compliance
- **Privacy**: Configurable data sensitivity levels

## 📈 Business Value

### For Leadership
- Strategic execution visibility
- Risk identification and mitigation
- Performance accountability
- Compliance readiness

### For Organizations
- Improved strategic alignment
- Faster course correction
- Enhanced team performance
- Better decision intelligence

## 🤝 Contributing

This system was built for Apeejay Education's specific needs. For customization or extension:

1. Fork the repository
2. Create feature branches for modifications
3. Ensure proper testing of new features
4. Update documentation for changes
5. Submit pull requests for review

## 📞 Support

For technical support or feature requests related to Apeejay Education's implementation, contact the internal development team.

---

**Built with ❤️ for Strategic Excellence at Apeejay Education**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
# mos_enterprise
