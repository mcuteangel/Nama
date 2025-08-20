import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, PlusCircle, Users, Home, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "خانه", icon: Home, path: "/" },
  { name: "افزودن مخاطب", icon: PlusCircle, path: "/add-contact" },
  { name: "گروه‌ها", icon: Users, path: "/groups" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          asChild
          onClick={() => isMobile && setIsSheetOpen(false)}
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
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 right-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-gray-700 text-white p-4 shadow-lg flex items-center justify-between z-50">
        <Link to="/" className="text-2xl font-bold">
          Nama Contacts
        </Link>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-sidebar dark:bg-sidebar-background flex flex-col p-0">
            <div className="p-4 border-b border-sidebar-border dark:border-sidebar-border">
              <h2 className="text-xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">
                Nama Contacts
              </h2>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-sidebar dark:bg-sidebar-background text-sidebar-foreground shadow-lg flex flex-col z-40">
      <div className="p-4 border-b border-sidebar-border dark:border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-primary dark:text-sidebar-primary-foreground">
          Nama Contacts
        </h2>
      </div>
      <NavLinks />
    </aside>
  );
};

export default Sidebar;