import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../settings";
import { Home } from "lucide-react";

const MobileHeader = () => {
  return (
    <div className={cn(
      "fixed top-0 right-0 w-full p-4 shadow-lg flex items-center justify-between z-50 fade-in-down",
      "glass-advanced border-b text-foreground backdrop-blur-md"
    )}>
      <Link 
        to="/" 
        className="flex items-center gap-2 text-2xl font-bold text-gradient hover:scale-105 transition-transform duration-300"
      >
        <Home size={24} className="text-primary" />
        <span>Nama Contacts</span>
      </Link>
      <ThemeToggle />
    </div>
  );
};

export default MobileHeader;