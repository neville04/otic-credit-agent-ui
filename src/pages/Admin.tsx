import { Layout } from "@/components/Layout";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Database, Activity } from "lucide-react";

export default function Admin() {
  const users = [
    { name: "Sarah Johnson", email: "sarah.j@company.com", role: "Admin", status: "Active" },
    { name: "Michael Chen", email: "michael.c@company.com", role: "Scheduler", status: "Active" },
    { name: "Emily Rodriguez", email: "emily.r@company.com", role: "Viewer", status: "Active" },
    { name: "David Kim", email: "david.k@company.com", role: "IT Admin", status: "Active" }
  ];

  const connections = [
    { name: "Azure AD", status: "connected" as const },
    { name: "SharePoint", status: "connected" as const },
    { name: "SQL Database", status: "connected" as const },
    { name: "OneDrive", status: "connected" as const }
  ];

  const auditLog = [
    { user: "Sarah Johnson", action: "Created schedule", detail: "Q4 Risk Assessment", time: "2 hours ago" },
    { user: "Michael Chen", action: "Modified template", detail: "Credit Analysis Standard", time: "5 hours ago" },
    { user: "Emily Rodriguez", action: "Viewed report", detail: "Customer 360 Financials", time: "1 day ago" },
    { user: "David Kim", action: "Updated connection", detail: "SQL Database", time: "2 days ago" }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-1 md:mb-2">
            Admin Portal
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Manage users, permissions, and enterprise integrations
          </p>
        </div>

        {/* User Management */}
        <SectionCard title="User Management" description="Manage roles and access control">
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Name</TableHead>
                  <TableHead className="text-xs md:text-sm hidden lg:table-cell">Email</TableHead>
                  <TableHead className="text-xs md:text-sm">Role</TableHead>
                  <TableHead className="text-xs md:text-sm hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-xs md:text-sm">
                      <div>{user.name}</div>
                      <div className="lg:hidden text-[10px] text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-muted-foreground hidden lg:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Select defaultValue={user.role.toLowerCase().replace(" ", "-")}>
                        <SelectTrigger className="w-[90px] md:w-[120px] text-xs md:text-sm h-8 md:h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="it-admin">IT Admin</SelectItem>
                          <SelectItem value="scheduler">Scheduler</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] md:text-xs font-medium">
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-8 px-2 md:px-3">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        {/* Connections */}
        <SectionCard title="Enterprise Connections" description="System integrations and data sources">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            {connections.map((conn, idx) => (
              <div key={idx} className="p-3 md:p-4 rounded-lg border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Database className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="font-medium text-foreground text-xs md:text-sm">{conn.name}</span>
                </div>
                <StatusBadge status={conn.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Audit Log */}
        <SectionCard title="Audit Log" description="Recent system activity">
          <div className="space-y-2 md:space-y-3">
            {auditLog.map((log, idx) => (
              <div key={idx} className="p-2 md:p-4 rounded-lg bg-muted/30 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-foreground">
                      <span className="text-primary">{log.user}</span> {log.action}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">{log.detail}</p>
                  </div>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
}
