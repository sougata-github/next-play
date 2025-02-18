"use client";

import { Button } from "@/components/ui/button";
import { Loader, UserCircleIcon } from "lucide-react";
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  ClerkLoading,
  ClerkLoaded,
} from "@clerk/nextjs";

const AuthButton = () => {
  return (
    <>
      <ClerkLoading>
        <div className="w-12 h-8 flex items-center justify-center">
          <Loader className="size-[18px] transition-all animate-spin" />
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 rounded-full border-blue-500/2 shadow-none [&_svg]:size-4"
            >
              <UserCircleIcon />
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
};

export default AuthButton;
