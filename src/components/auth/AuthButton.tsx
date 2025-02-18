import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";

const AuthButton = () => {
  return (
    <Button
      variant="outline"
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-full border-blue-500/2 shadow-none [&_svg]:size-4"
    >
      <UserCircleIcon />
      Sign in
    </Button>
  );
};

export default AuthButton;
