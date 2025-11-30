import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import oticLogo from "@/assets/otic-logo.jpg";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src={oticLogo} 
                alt="Otic Credit Agent" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-base md:text-xl font-display font-bold text-foreground">Otic Credit Agent</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Credit Intelligence Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="!text-foreground bg-muted"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </div>
              </NavLink>
              <NavLink
                to="/scheduler"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="!text-foreground bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Scheduler
                </div>
              </NavLink>
              <NavLink
                to="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                activeClassName="!text-foreground bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </div>
              </NavLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border backdrop-blur-xl bg-background/90 z-50">
        <div className="flex items-center justify-around py-3">
          <NavLink
            to="/dashboard"
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
            activeClassName="!text-primary"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </NavLink>
          <NavLink
            to="/scheduler"
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
            activeClassName="!text-primary"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Scheduler</span>
          </NavLink>
          <NavLink
            to="/admin"
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground"
            activeClassName="!text-primary"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Admin</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
