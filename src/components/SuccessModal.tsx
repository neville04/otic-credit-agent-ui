import { CheckCircle2, Calendar, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportDetails?: {
    name: string;
    nextRun: string;
    recipients: string;
    formats: string[];
  };
}

export const SuccessModal = ({ isOpen, onClose, reportDetails }: SuccessModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card-elevated rounded-2xl p-8 max-w-lg w-full animate-slide-up">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-glow">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Report Scheduled Successfully!
          </h2>
          <p className="text-muted-foreground">
            Your credit analysis report has been configured and scheduled
          </p>
        </div>

        {/* Details */}
        {reportDetails && (
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Report Name</p>
                  <p className="text-sm font-medium text-foreground">{reportDetails.name}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Run Time</p>
                  <p className="text-sm font-medium text-foreground">{reportDetails.nextRun}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                  <p className="text-sm font-medium text-foreground">
                    {reportDetails.formats.join(", ")} → {reportDetails.recipients}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              onClose();
              navigate("/scheduler");
            }}
          >
            View Schedule
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground"
            onClick={() => {
              onClose();
              navigate("/");
            }}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
