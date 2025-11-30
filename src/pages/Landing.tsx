import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, Users, Landmark, Shield, TrendingUp, FileText, 
  Database, Cpu, Network, CheckCircle2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import oticLogo from "@/assets/otic-logo.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Landing() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPassword);
    navigate("/dashboard");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(signupEmail, signupPassword);
    navigate("/dashboard");
  };

  const empoweredIndustries = [
    { icon: Building2, title: "Banks & Tier 1 Financial Institutions", description: "Enterprise-grade credit analysis" },
    { icon: Landmark, title: "Microfinance & SACCO Networks", description: "Automated risk assessment" },
    { icon: TrendingUp, title: "Fintech Lenders & Digital Banks", description: "Real-time credit decisions" },
    { icon: Shield, title: "Insurance & Asset Financing", description: "Risk evaluation & scoring" },
    { icon: FileText, title: "Credit Reference Institutions", description: "Comprehensive credit reports" },
    { icon: Users, title: "Corporate Finance & Audit", description: "Portfolio management tools" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src={oticLogo} 
                alt="Otic Credit Agent" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-base md:text-xl font-display font-bold text-secondary">Otic Credit Agent</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Credit Intelligence Platform</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('admin-access')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs md:text-sm"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-secondary/70" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-white animate-fade-in">
              The Intelligence Behind Every{" "}
              <span className="text-primary">Credit Decision</span>
            </h1>

            {/* Carousel */}
            <div className="max-w-2xl mx-auto">
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  <CarouselItem>
                    <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium">
                      <span className="text-primary">Automate</span> your organization's credit analysis
                    </p>
                  </CarouselItem>
                  <CarouselItem>
                    <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium">
                      <span className="text-primary">Accelerate</span> your organization's credit analysis
                    </p>
                  </CarouselItem>
                  <CarouselItem>
                    <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium">
                      <span className="text-primary">Elevate</span> your organization's credit analysis
                    </p>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary-glow text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => document.getElementById('admin-access')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                asChild
              >
                <a href="mailto:info@oticgroup.net">Book a Demo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What It Is Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-secondary">
                What is Otic Credit Agent?
              </h2>
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-foreground/80">
                <p>
                  An enterprise-grade Agentic AI system designed to automate, accelerate, 
                  and elevate the entire credit analysis lifecycle across banks, microfinance 
                  institutions, SACCOs, fintechs, credit bureaus, insurance firms, and enterprise lenders.
                </p>
                <p>
                  Built with secure Azure-based Agentic AI architecture and integrated into 
                  Microsoft 365, Dynamics, Azure SQL, Power Platform, SharePoint, and enterprise 
                  identity systems.
                </p>
                <p className="font-semibold text-secondary">
                  A unified, fully automated credit decision engine for modern financial institutions.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:gap-6">
              {[
                { icon: Cpu, title: "AI-Powered Analysis", desc: "Advanced algorithms evaluate credit risk with precision" },
                { icon: Database, title: "Multi-Source Integration", desc: "Connect all your data sources seamlessly" },
                { icon: Network, title: "Enterprise-Ready", desc: "Secure, scalable, and compliant infrastructure" }
              ].map((feature, idx) => (
                <div key={idx} className="glass-card rounded-xl p-4 md:p-6 hover:glass-card-elevated transition-all">
                  <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-secondary mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who It Empowers Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-secondary mb-3 md:mb-4">
              Who We Empower
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by leading financial institutions across multiple sectors
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {empoweredIndustries.map((industry, idx) => (
              <div 
                key={idx} 
                className="glass-card rounded-xl p-4 md:p-6 hover:glass-card-elevated hover:border-primary/30 transition-all group cursor-pointer"
              >
                <industry.icon className="w-8 h-8 md:w-12 md:h-12 text-secondary group-hover:text-primary transition-colors mb-3 md:mb-4" />
                <h3 className="text-sm md:text-lg font-semibold text-secondary mb-1 md:mb-2 group-hover:text-primary transition-colors">
                  {industry.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-secondary mb-3 md:mb-4">
              How It Works
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Seamless integration with your existing infrastructure powered by Azure Agentic AI
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-lg md:text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-secondary">Connect Data Sources</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Integrate with Microsoft 365, SharePoint, SQL databases, and Google Workspace
              </p>
            </div>
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-lg md:text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-secondary">AI Evaluates Risk</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Advanced Agentic AI analyzes credit data and generates comprehensive risk assessments
              </p>
            </div>
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-lg md:text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-secondary">Reports & Workflows</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Automated reports delivered to your team via scheduled workflows
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section id="admin-access" className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs md:text-sm font-medium mb-3 md:mb-4">
                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                Secure Admin Access
              </div>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-secondary mb-3 md:mb-4">
                Get Started with Otic Credit Agent
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Only verified administrators can configure templates, schedules, and knowledge bases. 
                Secure your organization's credit intelligence platform today.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Login Form */}
              <div className="glass-card-elevated rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-2xl font-semibold text-secondary mb-1 md:mb-2">Admin Login</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">Access your organization's dashboard</p>
                <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-xs md:text-sm text-secondary">Email</Label>
                    <Input 
                      id="login-email"
                      type="email" 
                      placeholder="admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="mt-1 text-sm md:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-xs md:text-sm text-secondary">Password</Label>
                    <Input 
                      id="login-password"
                      type="password" 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="mt-1 text-sm md:text-base"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold text-sm md:text-base"
                    size="lg"
                  >
                    Log in to Console
                  </Button>
                </form>
              </div>

              {/* Signup Form */}
              <div className="glass-card-elevated rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-2xl font-semibold text-secondary mb-1 md:mb-2">Request Admin Access</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">Start your credit intelligence journey</p>
                <form onSubmit={handleSignup} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-xs md:text-sm text-secondary">Email</Label>
                    <Input 
                      id="signup-email"
                      type="email" 
                      placeholder="your.email@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="mt-1 text-sm md:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-xs md:text-sm text-secondary">Password</Label>
                    <Input 
                      id="signup-password"
                      type="password" 
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="mt-1 text-sm md:text-base"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-sm md:text-base"
                    size="lg"
                  >
                    Request Admin Access
                  </Button>
                </form>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 md:mt-12 grid sm:grid-cols-3 gap-4 md:gap-6">
              {[
                "Enterprise-grade security",
                "Role-based access control",
                "Comprehensive audit logs"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src={oticLogo} 
                alt="Otic Credit Agent" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
              />
              <div className="text-center md:text-left">
                <h3 className="text-base md:text-lg font-display font-bold">Otic Credit Agent</h3>
                <p className="text-xs md:text-sm text-secondary-foreground/80">
                  The Future of Credit Analysis. Delivered Today.
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-secondary-foreground/60 text-center md:text-right">
              © 2024 Otic Credit Agent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
