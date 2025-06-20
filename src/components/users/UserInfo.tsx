import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const userInfoVariants = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_p]:text-sm [&_svg]:size-4",
      lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_p]:text-black",
      sm: "[&_p]:text-xs [&_svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface Props extends VariantProps<typeof userInfoVariants> {
  name: string;
  className?: string;
}

const UserInfo = ({ name, className, size }: Props) => {
  return (
    <div className={cn(userInfoVariants({ size, className }))}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="line-clamp-1 text-black dark:text-white">{name}</p>
        </TooltipTrigger>
        <TooltipContent align="center" className="bg-black/70">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default UserInfo;
