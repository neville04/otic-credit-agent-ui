import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/AgentChat";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { 
  FileText, Clock, CheckCircle, TrendingUp, 
  Calendar, Mail, File, Loader2, AlertCircle, Plus, Activity, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";

interface Report {
  id: string;
  name: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  template: string;
  execution_time_ms: number | null;
}

interface Schedule {
  id: string;
  name: string;
  template: string;
  next_run_at: string | null;
  schedule_time: string | null;
  recipients: string[] | null;
  output_formats: string[] | null;
}

interface DashboardStats {
  activeReports: number;
  scheduled: number;
  successRate: number;
  avgTime: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { organizationId, isLoading: roleLoading } = useUserRole();
  
  const [stats, setStats] = useState<DashboardStats>({
    activeReports: 0,
    scheduled: 0,
    successRate: 0,
    avgTime: "N/A",
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch reports
        const { data: reports, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (reportsError) throw reportsError;

        // Fetch schedules
        const { data: schedules, error: schedulesError } = await supabase
          .from("schedules")
          .select("*")
          .eq("is_active", true)
          .order("next_run_at", { ascending: true })
          .limit(1);

        if (schedulesError) throw schedulesError;

        // Calculate stats
        const completedReports = reports?.filter(r => r.status === "completed") || [];
        const processingReports = reports?.filter(r => r.status === "processing") || [];
        const totalReports = reports?.length || 0;
        const successRate = totalReports > 0 
          ? Math.round((completedReports.length / totalReports) * 100) 
          : 0;
        
        // Calculate average execution time
        const timesWithValue = reports?.filter(r => r.execution_time_ms) || [];
        const avgTimeMs = timesWithValue.length > 0
          ? timesWithValue.reduce((acc, r) => acc + (r.execution_time_ms || 0), 0) / timesWithValue.length
          : 0;
        const avgTimeStr = avgTimeMs > 0 ? `${Math.round(avgTimeMs / 1000)}s` : "N/A";

        setStats({
          activeReports: processingReports.length,
          scheduled: schedules?.length || 0,
          successRate,
          avgTime: avgTimeStr,
        });

        setRecentReports(reports || []);
        setNextSchedule(schedules?.[0] || null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!roleLoading) {
      fetchDashboardData();
    }
  }, [organizationId, roleLoading]);

  if (authLoading || roleLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!organizationId) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-secondary mb-2">No Organization Assigned</h2>
          <p className="text-muted-foreground max-w-md">
            Your account is not yet assigned to an organization. Please contact your administrator to get access.
          </p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-primary";
      case "failed": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold text-secondary mb-1">Dashboard Overview</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Monitor your credit analysis operations</p>
          </div>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all text-xs md:text-base h-9 md:h-11"
            onClick={() => navigate("/scheduler")}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Create New Report</span>
            <span className="sm:hidden">New Report</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <StatCard
            title="Active Reports"
            value={stats.activeReports.toString()}
            icon={FileText}
            description="Currently processing"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduled.toString()}
            icon={Calendar}
            description="Active schedules"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={TrendingUp}
            description="All time"
          />
          <StatCard
            title="Avg. Time"
            value={stats.avgTime}
            icon={Clock}
            description="Per report"
          />
        </div>

        {/* Next Scheduled Report */}
        {nextSchedule && (
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
                    <h3 className="text-sm md:text-lg font-semibold text-foreground mb-0.5 md:mb-1 truncate">{nextSchedule.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{nextSchedule.template}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-border">
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Scheduled Time</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {nextSchedule.next_run_at 
                      ? format(new Date(nextSchedule.next_run_at), "MMM d, yyyy HH:mm")
                      : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Recipients</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {nextSchedule.recipients?.length || 0} recipient(s)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Output Format</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {nextSchedule.output_formats?.join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-base md:text-xl font-display font-semibold text-foreground">Analytics Overview</h2>
          </div>
          <DashboardAnalytics organizationId={organizationId} />
        </div>

        {/* Agent Chat & Recent Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Agent Chat */}
          <AgentChat organizationId={organizationId} />

          {/* Recent Activity */}
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-6 h-fit">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-xl font-display font-semibold text-foreground">Recent Activity</h2>
            </div>
            
            {recentReports.length > 0 ? (
              <div className="space-y-2 md:space-y-4">
                {recentReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-2 md:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 ${
                        report.status === "completed" ? "bg-green-400" : 
                        report.status === "processing" ? "bg-primary" : "bg-destructive"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-foreground truncate">{report.name}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {report.template} • {format(new Date(report.created_at), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reports yet. Create your first report to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
