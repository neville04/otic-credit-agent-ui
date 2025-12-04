import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Shield, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import oticLogo from "@/assets/otic-logo.jpg";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [organizationName, setOrganizationName] = useState("");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to register organization
      const { data, error } = await supabase.functions.invoke("register-organization", {
        body: {
          organizationName,
          organizationEmail,
          adminEmail,
          password,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Registration successful!",
        description: "Your organization has been created. You can now log in.",
      });

      // Navigate to landing page for login
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
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
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs md:text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Building2 className="w-3 h-3 md:w-4 md:h-4" />
              New Organization
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary mb-2">
              Register Your Organization
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Set up your organization to start using Otic Credit Agent
            </p>
          </div>

          <div className="glass-card-elevated rounded-xl p-6 md:p-8">
            <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
              {/* Organization Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-secondary mb-2">
                  <Building2 className="w-4 h-4" />
                  Organization Details
                </div>
                
                <div>
                  <Label htmlFor="org-name" className="text-xs md:text-sm text-secondary">
                    Organization Name *
                  </Label>
                  <Input 
                    id="org-name"
                    type="text" 
                    placeholder="e.g., ABC Bank Limited"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="mt-1 text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="org-email" className="text-xs md:text-sm text-secondary">
                    Organization Email *
                  </Label>
                  <Input 
                    id="org-email"
                    type="email" 
                    placeholder="info@organization.com"
                    value={organizationEmail}
                    onChange={(e) => setOrganizationEmail(e.target.value)}
                    className="mt-1 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Admin Account */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-secondary mb-2">
                  <Shield className="w-4 h-4" />
                  Admin Account
                </div>

                <div>
                  <Label htmlFor="admin-email" className="text-xs md:text-sm text-secondary">
                    Admin Email *
                  </Label>
                  <Input 
                    id="admin-email"
                    type="email" 
                    placeholder="admin@organization.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-1 text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs md:text-sm text-secondary">
                    Password *
                  </Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 text-sm md:text-base"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-xs md:text-sm text-secondary">
                    Confirm Password *
                  </Label>
                  <Input 
                    id="confirm-password"
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 text-sm md:text-base"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold text-sm md:text-base"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Register Organization
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/")}
                className="text-primary hover:underline font-medium"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
