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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card-elevated rounded-xl md:rounded-2xl p-4 md:p-8 max-w-lg w-full animate-slide-up">
        {/* Success Icon */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-glow">
            <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl font-display font-bold text-foreground mb-1 md:mb-2">
            Report Scheduled Successfully!
          </h2>
          <p className="text-xs md:text-base text-muted-foreground">
            Your credit analysis report has been configured and scheduled
          </p>
        </div>

        {/* Details */}
        {reportDetails && (
          <div className="space-y-2 md:space-y-4 mb-4 md:mb-8">
            <div className="p-2 md:p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-2 md:gap-3">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Report Name</p>
                  <p className="text-xs md:text-sm font-medium text-foreground truncate">{reportDetails.name}</p>
                </div>
              </div>
            </div>

            <div className="p-2 md:p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-2 md:gap-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Next Run Time</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">{reportDetails.nextRun}</p>
                </div>
              </div>
            </div>

            <div className="p-2 md:p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-2 md:gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Delivery</p>
                  <p className="text-xs md:text-sm font-medium text-foreground break-words">
                    {reportDetails.formats.join(", ")} → {reportDetails.recipients}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button 
            variant="outline" 
            className="flex-1 text-xs md:text-sm h-9 md:h-10"
            onClick={() => {
              onClose();
              navigate("/scheduler");
            }}
          >
            View Schedule
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground text-xs md:text-sm h-9 md:h-10"
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
