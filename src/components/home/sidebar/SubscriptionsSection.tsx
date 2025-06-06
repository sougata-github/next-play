"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import UserAvatar from "@/components/UserAvatar";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PersonalSection = () => {
  const { state } = useSidebar();

  const pathname = usePathname();

  const { data } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {data?.pages[0]?.items &&
            data.pages[0].items.length > 0 &&
            data?.pages.flatMap((page) =>
              page.items.map((subscription) => (
                <SidebarMenuItem
                  key={`${subscription.creatorId}-${subscription.viewerId}`}
                >
                  <SidebarMenuButton
                    tooltip={subscription.creator.name}
                    asChild
                    isActive={pathname === `/users/${subscription.creator.id}`}
                  >
                    <Link
                      href={`/users/${subscription.creatorId}`}
                      className={cn(
                        "flex items-center gap-4",
                        state === "collapsed" && "justify-center"
                      )}
                    >
                      <UserAvatar
                        size="sm"
                        imageUrl={subscription.creator.imageUrl}
                        name={subscription.creator.name}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          state === "collapsed" && "hidden"
                        )}
                      >
                        {subscription.creator.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default PersonalSection;
