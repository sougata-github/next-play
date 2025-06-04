"use client";

import { cn } from "@/lib/utils";

import { Button, ButtonProps } from "../ui/button";
import { useAuth } from "@clerk/nextjs";

interface Props {
  onClick: ButtonProps["onClick"];
  disabled: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

const SubscriptionButton = ({
  onClick,
  disabled,
  isSubscribed,
  className,
  size,
}: Props) => {
  const { isSignedIn } = useAuth();

  return (
    <Button
      size={size}
      variant={isSubscribed && isSignedIn ? "secondary" : "default"}
      className={cn("rounded-full", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {isSubscribed && isSignedIn ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

export default SubscriptionButton;
