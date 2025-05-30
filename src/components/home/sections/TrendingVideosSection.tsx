"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import VideoGridCard, {
  VideoGridCardSkeleton,
} from "@/components/videos/VideoGridCard";

import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const TrendingVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="gap-4 gap-y-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {[...new Array(18)].fill(0).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const TrendingVideosSectionSuspense = () => {
  const isMobile = useIsMobile();

  const [results, resultsQuery] =
    trpc.videos.getManyTrending.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  if (!results.pages[0].videosWithReactions) {
    return (
      <p className="m-4 text-muted-foreground text-center text-lg">
        No videos yet
      </p>
    );
  }

  return (
    <>
      {isMobile ? (
        results.pages[0].videosWithReactions?.length > 0 ? (
          <div className="flex flex-col gap-4 gap-y-10">
            {results.pages.flatMap((page) =>
              page?.videosWithReactions?.map((video) => (
                <VideoGridCard key={video.id} data={video} />
              ))
            )}
            <InfiniteScroll
              isManual
              fetchNextPage={resultsQuery.fetchNextPage}
              isFetchingNextPage={resultsQuery.isFetchingNextPage}
              hasNextPage={resultsQuery.hasNextPage}
            />
          </div>
        ) : (
          <p className="m-4 text-center text-lg font-medium text-muted-foreground/40">
            No videos yet
          </p>
        )
      ) : results.pages[0].videosWithReactions.length > 0 ? (
        <div>
          <div className="gap-4 gap-y-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
            {results.pages.flatMap((page) =>
              page?.videosWithReactions?.map((video) => (
                <VideoGridCard key={video.id} data={video} />
              ))
            )}
          </div>

          <InfiniteScroll
            fetchNextPage={resultsQuery.fetchNextPage}
            isFetchingNextPage={resultsQuery.isFetchingNextPage}
            hasNextPage={resultsQuery.hasNextPage}
          />
        </div>
      ) : (
        <p className="m-4 text-muted-foreground/40 text-center text-lg font-medium">
          No videos yet
        </p>
      )}
    </>
  );
};

const TrendingVideosSection = () => {
  return (
    <Suspense fallback={<TrendingVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <TrendingVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default TrendingVideosSection;
