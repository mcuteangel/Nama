import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle

const MobileHeader = () => {
  return (
    <div className={cn(
      "fixed top-0 right-0 w-full p-4 shadow-lg flex items-center justify-between z-50", // Changed to justify-between
      "glass border-b text-foreground"
    )}>
      <Link to="/" className="text-2xl font-bold">
        Nama Contacts
      </Link>
      <ThemeToggle /> {/* Add ThemeToggle here */}
    </div>
  );
};

export default MobileHeader;