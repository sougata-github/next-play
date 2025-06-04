import { useSubscription } from "@/hooks/useSubscription";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn, displayCount } from "@/lib/utils";
import { UserGetOneOutput } from "@/types";
import Link from "next/link";

import SubscriptionButton from "../subscriptions/SubscriptionButton";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../UserAvatar";
import { Button } from "../ui/button";

interface Props {
  user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="size-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48 mt-1" />
          </div>
        </div>

        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Skeleton className="size-[160px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48 mt-4" />
          <Skeleton className="h-10 w-64 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const UserPageInfo = ({ user }: Props) => {
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.isSubscribed,
  });

  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  return (
    <div className="py-6">
      {/* Mobile View */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="h-[60px] w-[60px]"
            onClick={() => {
              if (user.clerkId === userId) {
                clerk.openUserProfile();
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>
                {user._count.subscribers}{" "}
                {displayCount(user._count.subscribers, "subscriber")}
              </span>
              <span>&bull;</span>
              <span>
                {user._count.videos} {displayCount(user._count.videos, "video")}
              </span>
            </div>
          </div>
        </div>
        {userId === user.clerkId ? (
          <Button
            variant="secondary"
            asChild
            className="w-full mt-3 rounded-full"
          >
            <Link href="/studio">Go to Studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={onClick}
            disabled={isPending || !isLoaded}
            isSubscribed={user.isSubscribed}
            className="w-full mt-3"
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="md:flex items-start gap-4 hidden">
        <UserAvatar
          size="xl"
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            userId === user.clerkId &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300"
          )}
          onClick={() => {
            if (user.clerkId === userId) {
              clerk.openUserProfile();
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>
              {user._count.subscribers}{" "}
              {displayCount(user._count.subscribers, "subscriber")}
            </span>
            <span>&bull;</span>
            <span>
              {user._count.videos} {displayCount(user._count.videos, "video")}
            </span>
          </div>
          {userId === user.clerkId ? (
            <Button variant="secondary" asChild className="mt-3 rounded-full">
              <Link href="/studio">Go to Studio</Link>
            </Button>
          ) : (
            <SubscriptionButton
              onClick={onClick}
              disabled={isPending || !isLoaded}
              isSubscribed={user.isSubscribed}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPageInfo;
