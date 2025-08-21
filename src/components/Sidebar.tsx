import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, Users, Home, Menu, Settings } from "lucide-react"; // Import Settings icon
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: "خانه", icon: Home, path: "/" },
  { name: "افزودن مخاطب", icon: PlusCircle, path: "/add-contact" },
  { name: "گروه‌ها", icon: Users, path: "/groups" },
  { name: "فیلدهای سفارشی", icon: Settings, path: "/custom-fields" }, // New navigation item
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

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
    <aside className={cn(
      "fixed right-0 top-0 h-full shadow-lg flex flex-col z-40 transition-all duration-300 ease-in-out",
      "glass border-l",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="p-4 border-b border-sidebar-border dark:border-sidebar-border flex items-center justify-between">
        {isOpen && (
          <h2 className="text-2xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground whitespace-nowrap overflow-hidden">
            Nama Contacts
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isOpen ? "" : "mx-auto"
          )}
        >
          <Menu size={24} />
        </Button>
      </div>
      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {navItems.map((item) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isOpen ? "justify-start" : "justify-center"
                )}
                asChild
              >
                <Link to={item.path} className="flex items-center">
                  <item.icon size={20} className={cn(isOpen ? "me-2" : "mx-auto")} />
                  {isOpen && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="left">{item.name}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border dark:border-sidebar-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isOpen ? "justify-start" : "justify-center"
              )}
            >
              <LogOut size={20} className={cn(isOpen ? "me-2" : "mx-auto")} />
              {isOpen && <span className="whitespace-nowrap overflow-hidden">خروج</span>}
            </Button>
          </TooltipTrigger>
          {!isOpen && <TooltipContent side="left">خروج</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;