import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, Users, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "خانه", icon: Home, path: "/" },
  { name: "افزودن مخاطب", icon: PlusCircle, path: "/add-contact" },
  { name: "گروه‌ها", icon: Users, path: "/groups" },
];

const Sidebar = () => {
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
      "fixed right-0 top-0 h-full w-64 text-sidebar-foreground shadow-lg flex flex-col z-40",
      "glass border-l"
    )}>
      <div className="p-4 border-b border-sidebar-border dark:border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">
          Nama Contacts
        </h2>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            asChild
          >
            <Link to={item.path}>
              <item.icon size={20} className="ms-2" />
              {item.name}
            </Link>
          </Button>
        ))}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-auto"
        >
          <LogOut size={20} className="ms-2" />
          خروج
        </Button>
      </nav>
    </aside>
  );
};

export default Sidebar;