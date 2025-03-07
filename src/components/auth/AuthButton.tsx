"use client";

import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  ClerkLoading,
  ClerkLoaded,
} from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";

const AuthButton = () => {
  return (
    <>
      <ClerkLoading>
        <div className="flex items-center justify-center">
          <Skeleton className="h-8 w-[104px] rounded-full" />
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                href="/studio"
                label="Studio"
                labelIcon={<ClapperboardIcon className="size-4" />}
              />
              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
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
