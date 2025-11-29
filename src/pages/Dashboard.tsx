import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Clock, Plus, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="glass-card-elevated rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              Enterprise Credit Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              The Intelligence Behind Every{" "}
              <span className="text-gradient">Credit Decision</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Universal enterprise Agentic AI that automates and augments the entire credit analysis lifecycle. 
              Secure Azure-based architecture integrating seamlessly with your enterprise systems.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold shadow-lg hover:shadow-xl glow-primary transition-all"
              onClick={() => navigate("/scheduler")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Reports"
            value="24"
            icon={FileText}
            description="Running this month"
            trend={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Scheduled Reports"
            value="8"
            icon={Calendar}
            description="Next 7 days"
          />
          <StatCard
            title="Success Rate"
            value="98.5%"
            icon={TrendingUp}
            description="Last 7 days"
            trend={{ value: "2.3%", positive: true }}
          />
          <StatCard
            title="Avg. Processing"
            value="4.2min"
            icon={Clock}
            description="Per report"
          />
        </div>

        {/* Next Scheduled Report */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground mb-1">Next Scheduled Report</h2>
              <p className="text-sm text-muted-foreground">Your upcoming credit analysis</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/scheduler")}>
              View All
            </Button>
          </div>
          
          <div className="glass-card rounded-lg p-6 border border-primary/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Q4 Portfolio Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">Credit Risk Profile Template</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                In 2 hours
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scheduled Time</p>
                <p className="text-sm font-medium text-foreground">Today, 4:00 PM UTC</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recipients</p>
                <p className="text-sm font-medium text-foreground">Risk Analysis Team</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Output Format</p>
                <p className="text-sm font-medium text-foreground">Excel, PDF, Power BI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-semibold text-foreground">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { title: "Credit Analysis Standard", time: "2 hours ago", status: "success" },
              { title: "Customer 360 Financials", time: "5 hours ago", status: "success" },
              { title: "Loan Eligibility Insights", time: "1 day ago", status: "success" },
              { title: "Portfolio Stress Test", time: "2 days ago", status: "success" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span className="text-xs text-green-400 font-medium">Completed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
