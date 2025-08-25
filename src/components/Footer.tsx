import { MadeWithDyad } from "@/components/made-with-dyad";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-4 text-center shadow-inner mt-auto">
      <div className="container mx-auto">
        <p className="text-sm mb-2">
          &copy; {new Date().getFullYear()} Nama Contacts. تمامی حقوق محفوظ است.
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;