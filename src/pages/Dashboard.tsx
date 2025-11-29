import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Clock, Plus, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Hero Section */}
        <div className="glass-card-elevated rounded-xl md:rounded-2xl p-4 md:p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium mb-2 md:mb-4">
              Enterprise Credit Intelligence
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-2 md:mb-4 leading-tight">
              The Intelligence Behind Every{" "}
              <span className="text-gradient">Credit Decision</span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-4 md:mb-8 max-w-2xl">
              Universal enterprise Agentic AI that automates and augments the entire credit analysis lifecycle.
            </p>
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary hover:bg-primary-glow text-primary-foreground font-semibold shadow-lg hover:shadow-xl glow-primary transition-all text-sm md:text-base"
              onClick={() => navigate("/scheduler")}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <StatCard
            title="Active Reports"
            value="24"
            icon={FileText}
            description="Running this month"
            trend={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Scheduled"
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
            title="Avg. Time"
            value="4.2min"
            icon={Clock}
            description="Per report"
          />
        </div>

        {/* Next Scheduled Report */}
        <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div>
              <h2 className="text-base md:text-xl font-display font-semibold text-foreground mb-0.5 md:mb-1">Next Scheduled Report</h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Your upcoming credit analysis</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/scheduler")} className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-4">
              View All
            </Button>
          </div>
          
          <div className="glass-card rounded-lg p-3 md:p-6 border border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 md:gap-4 mb-3 md:mb-4">
              <div className="flex items-start gap-2 md:gap-4 flex-1 min-w-0">
                <div className="p-2 md:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground mb-0.5 md:mb-1 truncate">Q4 Portfolio Risk Assessment</h3>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">Credit Risk Profile Template</p>
                </div>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-medium self-start whitespace-nowrap">
                In 2 hours
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-border">
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Scheduled Time</p>
                <p className="text-xs md:text-sm font-medium text-foreground">Today, 4:00 PM UTC</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Recipients</p>
                <p className="text-xs md:text-sm font-medium text-foreground">Risk Analysis Team</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Output Format</p>
                <p className="text-xs md:text-sm font-medium text-foreground">Excel, PDF, Power BI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h2 className="text-base md:text-xl font-display font-semibold text-foreground">Recent Activity</h2>
          </div>
          
          <div className="space-y-2 md:space-y-4">
            {[
              { title: "Credit Analysis Standard", time: "2 hours ago", status: "success" },
              { title: "Customer 360 Financials", time: "5 hours ago", status: "success" },
              { title: "Loan Eligibility Insights", time: "1 day ago", status: "success" },
              { title: "Portfolio Stress Test", time: "2 days ago", status: "success" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 md:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span className="text-[10px] md:text-xs text-green-400 font-medium whitespace-nowrap ml-2">Completed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
