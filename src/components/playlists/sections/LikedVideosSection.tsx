"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import VideoGridCard, {
  VideoGridCardSkeleton,
} from "@/components/videos/VideoGridCard";

import { DEFAULT_LIMIT } from "@/constants";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const LikedVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10">
        {[...new Array(18)].fill(0).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const LikedVideosSectionSuspense = () => {
  const [results, resultsQuery] =
    trpc.playlists.getManyLiked.useSuspenseInfiniteQuery(
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
        Start liking some videos
      </p>
    );
  }

  return (
    <>
      {results.pages[0].videosWithReactions?.length > 0 ? (
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
          Start liking some videos
        </p>
      )}
    </>
  );
};

const LikedVideosSection = () => {
  return (
    <Suspense fallback={<LikedVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <LikedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default LikedVideosSection;
