import { MadeWithDyad } from "@/components/made-with-dyad";
import UserProfileForm from "@/components/user-management/UserProfileForm";

const UserProfile = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full w-full">
      <UserProfileForm />
      <MadeWithDyad />
    </div>
  );
};

export default UserProfile;