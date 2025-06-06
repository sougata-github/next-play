"use client";

import InfiniteScroll from "@/components/InfiniteScroll";

import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import SubscriptionItem, {
  SubscriptionItemSkeleton,
} from "../SubscriptionItem";

const SubscriptionsSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[...new Array(5)].fill(0).map((_, index) => (
        <SubscriptionItemSkeleton key={index} />
      ))}
    </div>
  );
};

const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();

  const [subscriptions, resultsQuery] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const unscubscribe = trpc.subscriptions.unsubscribe.useMutation({
    onSuccess: (data) => {
      toast.success("Unsubscribed");
      utils.users.getOne.invalidate({ userId: data.creatorId });
      utils.videos.getManySubscribed.invalidate();
      utils.subscriptions.getMany.invalidate();
    },
    onError: () => {
      toast.error("Failed to perform action");
    },
  });

  if (!subscriptions.pages[0].items) {
    return (
      <p className="m-4 text-muted-foreground text-center text-lg">
        Start Subscribing to your favourite creators.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {subscriptions.pages[0].items.length > 0 ? (
          <>
            {subscriptions.pages.flatMap((page) =>
              page.items.map((subscription) => (
                <Link
                  href={`/users/${subscription.creatorId}`}
                  key={subscription.id}
                >
                  <SubscriptionItem
                    name={subscription.creator.name}
                    imageUrl={subscription.creator.imageUrl}
                    subscriberCount={subscription.creator._count.subscribers}
                    onUnsubscribe={() => {
                      unscubscribe.mutate({ userId: subscription.creator.id });
                    }}
                    disabled={unscubscribe.isPending}
                  />
                </Link>
              ))
            )}
            <InfiniteScroll
              fetchNextPage={resultsQuery.fetchNextPage}
              isFetchingNextPage={resultsQuery.isFetchingNextPage}
              hasNextPage={resultsQuery.hasNextPage}
            />
          </>
        ) : (
          <p className="text-sm">
            Start Subscribing to your favourite creators.
          </p>
        )}
      </div>
    </>
  );
};

const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default SubscriptionsSection;
