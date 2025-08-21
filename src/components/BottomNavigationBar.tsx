import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, Users, Home, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const BottomNavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); // Initialize useTranslation

  const navItems = [
    { name: t('common.home'), icon: Home, path: "/" },
    { name: t('common.add_contact'), icon: PlusCircle, path: "/add-contact" },
    { name: t('common.groups'), icon: Users, path: "/groups" },
    { name: t('common.custom_fields'), icon: Settings, path: "/custom-fields" },
    { name: t('common.profile'), icon: User, path: "/profile" },
    { name: t('common.settings'), icon: Settings, path: "/settings" }, // New navigation item for Settings
  ];

  const handleLogout = async () => {
    const toastId = showLoading(t('common.logout_loading'));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess(t('common.logout_success'));
      navigate("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      showError(`${t('common.logout_error')}: ${error.message || t('common.unknown_error')}`);
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 w-full p-2 shadow-lg flex items-center justify-around z-50",
      "glass border-t text-foreground"
    )}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center text-xs p-1 h-auto min-w-[60px]",
            "hover:bg-white/20",
            location.pathname === item.path ? "text-blue-200 dark:text-blue-300" : ""
          )}
          asChild
        >
          <Link to={item.path}>
            <div className="flex flex-col items-center justify-center">
              <item.icon size={20} className="mb-1" />
              {item.name}
            </div>
          </Link>
        </Button>
      ))}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex flex-col items-center justify-center text-xs p-1 h-auto min-w-[60px] hover:bg-white/20"
      >
        <div className="flex flex-col items-center justify-center">
          <LogOut size={20} className="mb-1" />
          {t('common.logout')}
        </div>
      </Button>
    </div>
  );
};

export default BottomNavigationBar;