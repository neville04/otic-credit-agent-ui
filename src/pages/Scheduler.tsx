import { useState } from "react";
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
import { CalendarIcon, Sparkles, Send, Eye, Database, Save } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Scheduler() {
  const navigate = useNavigate();
  const [reportName, setReportName] = useState("");
  const [template, setTemplate] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [date, setDate] = useState<Date>();
  const [recurrence, setRecurrence] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [recipients, setRecipients] = useState("");

  const handleScheduleReport = async () => {
    if (!reportName || !template || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Placeholder for backend call
    toast.success("Report scheduled successfully!");
    
    // Navigate to success modal or dashboard
    setTimeout(() => {
      navigate("/?success=true");
    }, 1000);
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
      <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Schedule Credit Analysis Report
          </h1>
          <p className="text-muted-foreground">
            Configure and schedule automated credit intelligence reports powered by Azure Agentic AI
          </p>
        </div>

        {/* Report Details */}
        <SectionCard title="Report Details" description="Define your report configuration">
          <div className="space-y-6">
            <div>
              <Label htmlFor="reportName">Report Name *</Label>
              <Input
                id="reportName"
                placeholder="e.g., Q4 Portfolio Risk Assessment"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="template">Select Report Template *</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Credit Analysis Standard</SelectItem>
                  <SelectItem value="risk">Credit Risk Profile</SelectItem>
                  <SelectItem value="360">Customer 360 Financials</SelectItem>
                  <SelectItem value="eligibility">Loan Eligibility Insights</SelectItem>
                  <SelectItem value="stress">Portfolio Stress Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt">Custom Analysis Prompt (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Add specific instructions for the AI analysis..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Suggestion
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Template
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Scheduling */}
        <SectionCard title="Schedule Configuration" description="Set when your report should run">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left mt-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="mt-2">
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
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Output Formats *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
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
                    <label className="flex-1 cursor-pointer text-sm font-medium">
                      {format.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="recipients">Email Recipients</Label>
              <Input
                id="recipients"
                placeholder="email1@company.com, email2@company.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="mt-2"
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">Import from Outlook</Button>
                <Button variant="outline" size="sm">Import from Gmail</Button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Knowledge Bases */}
        <SectionCard title="Knowledge Bases & Data Sources" description="Connect to your enterprise data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map((source) => (
              <div key={source.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Database className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{source.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Enterprise data integration</p>
                    </div>
                  </div>
                  <StatusBadge status={source.status} />
                </div>
                {source.status === "disconnected" && (
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" size="lg">
            <Save className="w-5 h-5 mr-2" />
            Save as Draft
          </Button>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold glow-primary"
            onClick={handleScheduleReport}
          >
            <Send className="w-5 h-5 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>
    </Layout>
  );
}
