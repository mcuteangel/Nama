import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle
import React from "react";

const MobileHeader = () => {
  return (
    <div className={cn(
      "fixed top-0 right-0 w-full p-4 shadow-lg flex items-center justify-between z-50",
      "glass border-b text-foreground"
    )}>
      <Link to="/" className="text-2xl font-bold">
        Nama Contacts
      </Link>
      <ThemeToggle />
    </div>
  );
};

export default MobileHeader;