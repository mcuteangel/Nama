import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileHeader = () => {
  return (
    <div className={cn(
      "fixed top-0 right-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-gray-700 text-white p-4 shadow-lg flex items-center justify-center z-50",
      "backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80 border-b border-white/20 dark:border-gray-700/20"
    )}>
      <Link to="/" className="text-2xl font-bold">
        Nama Contacts
      </Link>
    </div>
  );
};

export default MobileHeader;