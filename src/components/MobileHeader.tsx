import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileHeader = () => {
  return (
    <div className={cn(
      "fixed top-0 right-0 w-full text-white p-4 shadow-lg flex items-center justify-center z-50",
      "glass border-b"
    )}>
      <Link to="/" className="text-2xl font-bold">
        Nama Contacts
      </Link>
    </div>
  );
};

export default MobileHeader;