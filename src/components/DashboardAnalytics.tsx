import { useEffect, useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface DashboardAnalyticsProps {
  organizationId: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#22c55e', '#ef4444'];

export function DashboardAnalytics({ organizationId }: DashboardAnalyticsProps) {
  const [activityData, setActivityData] = useState<{ date: string; reports: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [templateData, setTemplateData] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organizationId) return;

      try {
        // Fetch reports for the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        
        const { data: reports, error } = await supabase
          .from("reports")
          .select("created_at, status, template")
          .gte("created_at", sevenDaysAgo.toISOString());

        if (error) throw error;

        // Generate activity data for the last 7 days
        const days = eachDayOfInterval({
          start: sevenDaysAgo,
          end: new Date()
        });

        const activity = days.map(day => {
          const dayStart = startOfDay(day);
          const count = reports?.filter(r => {
            const reportDate = startOfDay(new Date(r.created_at));
            return reportDate.getTime() === dayStart.getTime();
          }).length || 0;
          
          return {
            date: format(day, "EEE"),
            reports: count
          };
        });

        setActivityData(activity);

        // Calculate status distribution
        const statusCounts = reports?.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const statusArr = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }));
        setStatusData(statusArr.length > 0 ? statusArr : [{ name: "No data", value: 1 }]);

        // Calculate template usage
        const templateCounts = reports?.reduce((acc, r) => {
          const shortName = r.template.split(" ").slice(0, 2).join(" ");
          acc[shortName] = (acc[shortName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const templateArr = Object.entries(templateCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setTemplateData(templateArr);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [organizationId]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Activity Trend */}
      <div className="glass-card rounded-xl p-4 md:p-6 lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="text-sm md:text-base font-semibold text-foreground">Report Activity (7 Days)</h3>
        </div>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorReports)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="glass-card rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="text-sm md:text-base font-semibold text-foreground">Status Overview</h3>
        </div>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {statusData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Template Usage */}
      {templateData.length > 0 && (
        <div className="glass-card rounded-xl p-4 md:p-6 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-sm md:text-base font-semibold text-foreground">Template Usage</h3>
          </div>
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  width={100}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
