import { cn } from "@/lib/utils";

import { Button, ButtonProps } from "../ui/button";

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
  return (
    <Button
      size={size}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn("rounded-full", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

export default SubscriptionButton;
