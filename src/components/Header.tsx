import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, Users, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";

const Header = () => {
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
    <header className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-gray-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-bold whitespace-nowrap">
          Nama Contacts
        </Link>
        <nav className="flex flex-wrap justify-center sm:justify-end gap-4">
          <Button variant="ghost" asChild className="text-white hover:bg-white/20">
            <Link to="/">
              <Home size={18} className="me-2" />
              خانه
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-white hover:bg-white/20">
            <Link to="/add-contact">
              <PlusCircle size={18} className="me-2" />
              افزودن مخاطب
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-white hover:bg-white/20">
            <Link to="/groups">
              <Users size={18} className="me-2" />
              گروه‌ها
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/20">
            <LogOut size={18} className="me-2" />
            خروج
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;