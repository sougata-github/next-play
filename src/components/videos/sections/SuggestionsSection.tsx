"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoRowCard, { VideoRowCardSkeleton } from "../VideoRowCard";
import VideoGridCard, { VideoGridCardSkeleton } from "../VideoGridCard";
import InfiniteScroll from "@/components/InfiniteScroll";

interface Props {
  videoId: string;
  isManual?: boolean;
}

const SuggestionsSectionSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {[...new Array(4)].fill(0).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="md:hidden block space-y-3">
        {[...new Array(4)].fill(0).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

const SuggestionsSectionSuspense = ({ videoId, isManual }: Props) => {
  const [videos, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="hidden md:block space-y-3">
        <h1 className="font-semibold text-xl mb-5">Suggested Videos</h1>
        {videos.pages[0].videosWithReactions.length > 0 ? (
          videos.pages.flatMap((page) =>
            page.videosWithReactions.map((video) => (
              <VideoRowCard key={video.id} data={video} size="compact" />
            ))
          )
        ) : (
          <p className="text-muted-foreground text-sm">No suggested videos</p>
        )}
      </div>
      <div className="block md:hidden space-y-5">
        <h1 className="font-semibold text-xl">Suggested Videos</h1>
        {videos.pages[0].videosWithReactions.length > 0 ? (
          videos.pages.flatMap((page) =>
            page.videosWithReactions.map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))
          )
        ) : (
          <p className="text-muted-foreground text-sm">No suggested videos</p>
        )}
      </div>
      {videos.pages[0].videosWithReactions.length > 0 && (
        <InfiniteScroll
          isFetchingNextPage={query.isFetchingNextPage}
          hasNextPage={query.hasNextPage}
          fetchNextPage={query.fetchNextPage}
          isManual={isManual}
        />
      )}
    </>
  );
};

const SuggestionsSection = ({ videoId, isManual }: Props) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default SuggestionsSection;
