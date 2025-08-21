import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import UserProfileForm from "@/components/UserProfileForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LoadingMessage from "@/components/LoadingMessage"; // Import LoadingMessage

const UserProfile = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <UserProfileForm />
      <MadeWithDyad />
    </div>
  );
};

export default UserProfile;