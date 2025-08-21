import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, Users, Home, Settings } from "lucide-react"; // Import Settings icon
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "خانه", icon: Home, path: "/" },
  { name: "افزودن مخاطب", icon: PlusCircle, path: "/add-contact" },
  { name: "گروه‌ها", icon: Users, path: "/groups" },
  { name: "فیلدها", icon: Settings, path: "/custom-fields" }, // New navigation item
];

const BottomNavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const toastId = showLoading("در حال خروج...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess("با موفقیت از حساب کاربری خود خارج شدید.");
      navigate("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      showError(`خطا در خروج: ${error.message || "خطای ناشناخته"}`);
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
            <item.icon size={20} className="mb-1" />
            {item.name}
          </Link>
        </Button>
      ))}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex flex-col items-center justify-center text-xs p-1 h-auto min-w-[60px] hover:bg-white/20"
      >
        <LogOut size={20} className="mb-1" />
        خروج
      </Button>
    </div>
  );
};

export default BottomNavigationBar;