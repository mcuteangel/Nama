import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernLoader } from "@/components/ui/modern-loader";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { Home, Users, Sparkles, Settings, ShieldCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


interface BottomNavigationBarProps {
  isAdmin: boolean;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: t('common.home'), icon: Home, path: "/" },
    { name: t('common.groups'), icon: Users, path: "/groups" },
    { name: t('ai_suggestions.title'), icon: Sparkles, path: "/ai-suggestions" },
    { name: t('common.settings'), icon: Settings, path: "/settings" },
  ];

  if (isAdmin) {
    navItems.push({ name: t('user_management.title'), icon: ShieldCheck, path: "/user-management" });
  }

  const { toast } = useToast();
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success(t('common.logout_success'));
      navigate("/login");
    } catch (error: unknown) {
      console.error("Error logging out:", error);
      toast.error(`${t('common.logout_error')}: ${(error as Error).message || t('common.unknown_error')}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 w-full p-2 shadow-lg flex items-center justify-around z-50 fade-in-up",
      "glass-advanced border-t text-foreground backdrop-blur-md"
    )}>
      {navItems.map((item) => (
        <GlassButton
          key={item.path}
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center text-xs p-1 h-auto min-w-[60px] hover-glow",
            "hover:bg-white/20",
            location.pathname === item.path ? "text-primary bg-primary/10" : ""
          )}
          asChild
        >
          <Link to={item.path}>
            <div className="flex flex-col items-center justify-center">
              <item.icon size={20} className="mb-1" />
              {item.name}
            </div>
          </Link>
        </GlassButton>
      ))}
      <GlassButton
        variant="ghost"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex flex-col items-center justify-center text-xs p-1 h-auto min-w-[60px] hover:bg-white/20 hover-glow"
      >
        <div className="flex flex-col items-center justify-center">
          {isLoggingOut ? <ModernLoader variant="spinner" size="sm" className="mb-1" /> : <LogOut size={20} className="mb-1" />}
          {t('common.logout')}
        </div>
      </GlassButton>
    </div>
  );
};

export default BottomNavigationBar;