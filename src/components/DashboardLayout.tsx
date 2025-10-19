import { ReactNode, useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Package, 
  Wallet, 
  HandHeart,
  Users,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useLanguage();
  const { signOut, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
    { icon: TrendingUp, label: t('income'), href: '/income' },
    { icon: TrendingDown, label: t('expense'), href: '/expenses' },
    { icon: FileText, label: t('reports'), href: '#reports' },
    { icon: Package, label: t('stock'), href: '#stock' },
    { icon: Wallet, label: t('cashBank'), href: '#cash-bank' },
    { icon: HandHeart, label: t('loans'), href: '#loans' },
    { icon: Users, label: t('donors'), href: '/donors' },
    { icon: Settings, label: t('settings'), href: '#settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">م</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 top-16 z-40 w-64 border-r bg-card transition-transform duration-300 lg:sticky lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-2 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
