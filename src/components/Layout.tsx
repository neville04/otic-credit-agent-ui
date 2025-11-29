import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Calendar, Settings, Sparkles } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Otic Credit Agent</h1>
                <p className="text-xs text-muted-foreground">Credit Intelligence Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border backdrop-blur-xl bg-background/90 z-50">
        <div className="flex items-center justify-around py-3">
          <NavLink
            to="/"
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
