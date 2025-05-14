"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoRowCard from "../VideoRowCard";
import VideoGridCard from "../VideoGridCard";
import InfiniteScroll from "@/components/InfiniteScroll";

interface Props {
  videoId: string;
  isManual?: boolean;
}

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
        {videos.pages.flatMap((page) =>
          page.videosWithReactions.map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))
        )}
      </div>
      <div className="block md:hidden space-y-10">
        {videos.pages.flatMap((page) =>
          page.videosWithReactions.map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))
        )}
      </div>
      <InfiniteScroll
        isFetchingNextPage={query.isFetchingNextPage}
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isManual={isManual}
      />
    </>
  );
};

const SuggestionsSection = ({ videoId, isManual }: Props) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default SuggestionsSection;
