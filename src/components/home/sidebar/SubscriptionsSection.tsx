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
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const LoadingSkeleton = () => {
  return [...new Array(4)].fill(0).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuButton disabled>
        <Skeleton className="size-6 rounded-full shrink-0" />
        <Skeleton className="h-6 w-full" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
};

const PersonalSection = () => {
  const { state } = useSidebar();

  const pathname = usePathname();

  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
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
          {isLoading && <LoadingSkeleton />}
          {!isLoading && data?.pages[0]?.items && data.pages[0].items.length > 0
            ? data?.pages.flatMap((page) =>
                page.items.map((subscription) => (
                  <SidebarMenuItem
                    key={`${subscription.creatorId}-${subscription.viewerId}`}
                  >
                    <SidebarMenuButton
                      tooltip={subscription.creator.name}
                      asChild
                      isActive={
                        pathname === `/users/${subscription.creator.id}`
                      }
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
              )
            : !isLoading && (
                <p
                  className={cn(
                    "pl-2 text-sm",
                    state === "collapsed" && "hidden"
                  )}
                >
                  No Subscriptions
                </p>
              )}
          {!isLoading &&
            data?.pages[0]?.items &&
            data.pages[0].items.length > 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/subscriptions"}
                >
                  <Link
                    href="/subscriptions"
                    className="flex items-center gap-4"
                  >
                    <ListIcon className="size-4" />
                    <span className="text-sm">All Subscriptions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default PersonalSection;
