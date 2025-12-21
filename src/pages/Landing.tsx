import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Target, Users, Shield, TrendingUp, CheckCircle, ArrowRight, Heart } from 'lucide-react';
import apeejayLogo from '@/assets/apeejay-logo.png';
const Landing = () => {
  const features = [{
    icon: Target,
    title: 'Initiative Tracking',
    description: 'Monitor strategic initiatives from approval to delivery with full visibility.'
  }, {
    icon: BarChart3,
    title: 'Execution Signals',
    description: 'Real-time health indicators and risk assessments for all active projects.'
  }, {
    icon: Users,
    title: 'People & Contributions',
    description: 'Track team contributions and performance across initiatives.'
  }, {
    icon: Shield,
    title: 'Audit Trail',
    description: 'Complete audit logging for compliance and accountability.'
  }, {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Comprehensive dashboards with actionable insights and trends.'
  }, {
    icon: CheckCircle,
    title: 'Monthly Snapshots',
    description: 'Structured monthly reviews capturing key deliveries and lessons learned.'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={apeejayLogo} alt="Apeejay Education Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">ETS / Cadence</h1>
              <p className="text-xs text-muted-foreground">Initiative Tracking System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img src={apeejayLogo} alt="Apeejay Education Logo" className="h-24 w-24 object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Apeejay ETS
            <span className="block text-primary">Management OS</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform for tracking strategic initiatives, managing execution signals, 
            and driving organizational excellence across your enterprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Manage Excellence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From initiative planning to execution tracking, our platform provides 
            complete visibility and control over your strategic operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feature => <Card key={feature.title} className="border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join the Apeejay ETS Management OS and take control of your strategic initiatives today.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={apeejayLogo} alt="Apeejay Education Logo" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-foreground">Apeejay ETS Management OS</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Built by <span className="font-medium">Cadence Infotech</span> with <Heart className="h-4 w-4 text-destructive fill-destructive" />
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;