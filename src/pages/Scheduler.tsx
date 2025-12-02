import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { CalendarIcon, Sparkles, Send, Eye, Database, Save, Loader2, Play } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import SuccessModal from "@/components/SuccessModal";

export default function Scheduler() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizationId, role } = useUserRole();
  
  const [reportName, setReportName] = useState("");
  const [template, setTemplate] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [date, setDate] = useState<Date>();
  const [recurrence, setRecurrence] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [recipients, setRecipients] = useState("");
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>(["sharepoint", "sql"]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const canSchedule = ["admin", "it_admin", "scheduler"].includes(role || "");

  const createReport = async () => {
    if (!reportName || !template) {
      toast.error("Please fill in report name and select a template");
      return null;
    }

    if (!organizationId || !user) {
      toast.error("You must be assigned to an organization to create reports");
      return null;
    }

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        organization_id: organizationId,
        created_by: user.id,
        name: reportName,
        template,
        custom_prompt: customPrompt || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating report:", error);
      throw new Error(error.message);
    }

    return report;
  };

  const triggerAzureAgent = async (reportId: string) => {
    const { data, error } = await supabase.functions.invoke("trigger-azure-agent", {
      body: {
        reportId,
        template,
        customPrompt,
        knowledgeBases: selectedKnowledgeBases,
      },
    });

    if (error) {
      console.error("Error triggering Azure agent:", error);
      throw new Error(error.message);
    }

    return data;
  };

  const handleRunNow = async () => {
    setIsRunningNow(true);

    try {
      const report = await createReport();
      if (!report) {
        setIsRunningNow(false);
        return;
      }

      await triggerAzureAgent(report.id);

      toast.success("Analysis started! Check the dashboard for results.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error(error instanceof Error ? error.message : "Failed to run analysis");
    } finally {
      setIsRunningNow(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!reportName || !template || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!organizationId || !user) {
      toast.error("You must be assigned to an organization");
      return;
    }

    setIsSubmitting(true);

    try {
      const recurrenceMap: Record<string, string> = {
        "once": "one_time",
        "daily": "daily",
        "weekly": "weekly",
        "monthly": "monthly",
        "custom": "one_time",
      };

      const { error } = await supabase
        .from("schedules")
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          name: reportName,
          template,
          custom_prompt: customPrompt || null,
          schedule_date: date.toISOString(),
          recurrence: recurrenceMap[recurrence] || "one_time",
          next_run_at: date.toISOString(),
          output_formats: selectedFormats,
          recipients: recipients.split(",").map(r => r.trim()).filter(Boolean),
          knowledge_bases: selectedKnowledgeBases,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Report scheduled successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error scheduling report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const formats = [
    { id: "xlsx", label: "Excel (.xlsx)" },
    { id: "docx", label: "Word (.docx)" },
    { id: "powerbi", label: "Power BI Dashboard" },
    { id: "pdf", label: "PDF" },
    { id: "json", label: "JSON Summary" }
  ];

  const dataSources = [
    { id: "sharepoint", name: "SharePoint Folder", status: "connected" as const },
    { id: "onedrive", name: "OneDrive Folder", status: "connected" as const },
    { id: "gdrive", name: "Google Drive Folder", status: "disconnected" as const },
    { id: "sql", name: "SQL Database", status: "connected" as const }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-1 md:mb-2">
            Schedule Credit Analysis Report
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Configure and schedule automated credit intelligence reports
          </p>
        </div>

        {/* Report Details */}
        <SectionCard title="Report Details" description="Define your report configuration">
          <div className="space-y-4 md:space-y-6">
            <div>
              <Label htmlFor="reportName" className="text-xs md:text-sm">Report Name *</Label>
              <Input
                id="reportName"
                placeholder="e.g., Q4 Portfolio Risk Assessment"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="mt-1 md:mt-2 text-sm md:text-base h-9 md:h-10"
              />
            </div>

            <div>
              <Label htmlFor="template" className="text-xs md:text-sm">Select Report Template *</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="mt-1 md:mt-2 text-sm md:text-base h-9 md:h-10">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-analysis">Credit Analysis Standard</SelectItem>
                  <SelectItem value="risk-profile">Credit Risk Profile</SelectItem>
                  <SelectItem value="customer-360">Customer 360 Financials</SelectItem>
                  <SelectItem value="loan-eligibility">Loan Eligibility Insights</SelectItem>
                  <SelectItem value="portfolio-stress">Portfolio Stress Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="text-xs md:text-sm">Custom Analysis Prompt (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Add specific instructions for the AI analysis..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="mt-1 md:mt-2 min-h-[80px] md:min-h-[100px] text-sm md:text-base"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  AI Suggestion
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9">
                  <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Preview Template
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Scheduling */}
        <SectionCard title="Schedule Configuration" description="Set when your report should run">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label className="text-xs md:text-sm">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left mt-1 md:mt-2 text-xs md:text-sm h-9 md:h-10">
                      <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="recurrence" className="text-xs md:text-sm">Recurrence</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="mt-1 md:mt-2 text-xs md:text-sm h-9 md:h-10">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Output Formats */}
        <SectionCard title="Output & Delivery" description="Choose report formats and recipients">
          <div className="space-y-4 md:space-y-6">
            <div>
              <Label className="mb-2 md:mb-3 block text-xs md:text-sm">Output Formats *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedFormats.includes(format.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedFormats((prev) =>
                        prev.includes(format.id)
                          ? prev.filter((f) => f !== format.id)
                          : [...prev, format.id]
                      );
                    }}
                  >
                    <Checkbox checked={selectedFormats.includes(format.id)} />
                    <label className="flex-1 cursor-pointer text-xs md:text-sm font-medium">
                      {format.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="recipients" className="text-xs md:text-sm">Email Recipients</Label>
              <Input
                id="recipients"
                placeholder="email1@company.com, email2@company.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="mt-1 md:mt-2 text-xs md:text-sm h-9 md:h-10"
              />
            </div>
          </div>
        </SectionCard>

        {/* Knowledge Bases */}
        <SectionCard title="Knowledge Bases & Data Sources" description="Connect to your enterprise data">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            {dataSources.map((source) => (
              <div 
                key={source.id} 
                className={`p-3 md:p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedKnowledgeBases.includes(source.id) && source.status === "connected"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  if (source.status === "connected") {
                    setSelectedKnowledgeBases((prev) =>
                      prev.includes(source.id)
                        ? prev.filter((kb) => kb !== source.id)
                        : [...prev, source.id]
                    );
                  }
                }}
              >
                <div className="flex flex-col gap-2 md:gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="p-1.5 md:p-2 rounded-lg bg-muted flex-shrink-0">
                        <Database className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-xs md:text-sm truncate">{source.name}</h4>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">Enterprise data integration</p>
                      </div>
                    </div>
                    <StatusBadge status={source.status} />
                  </div>
                  {source.status === "disconnected" && (
                    <Button variant="outline" size="sm" className="w-full text-xs md:text-sm h-8 md:h-9">
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-xs md:text-base h-10 md:h-11"
            onClick={handleRunNow}
            disabled={isRunningNow || !canSchedule}
          >
            {isRunningNow ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Run Now
              </>
            )}
          </Button>
          <Button 
            size="lg" 
            className="w-full sm:flex-1 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold glow-primary text-xs md:text-base h-10 md:h-11"
            onClick={handleScheduleReport}
            disabled={isSubmitting || !canSchedule}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Schedule Report
              </>
            )}
          </Button>
        </div>

        {!canSchedule && (
          <p className="text-sm text-muted-foreground text-center">
            You don't have permission to create reports. Contact your administrator.
          </p>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        reportName={reportName}
        template={template}
        scheduledDate={date}
        recipients={recipients.split(",").map(r => r.trim()).filter(Boolean)}
      />
    </Layout>
  );
}
