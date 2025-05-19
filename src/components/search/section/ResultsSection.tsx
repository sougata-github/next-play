"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import VideoGridCard from "@/components/videos/VideoGridCard";
import VideoRowCard from "@/components/videos/VideoRowCard";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  query: string | undefined;
  categoryId: string | undefined;
}

const ResultsSectionSuspense = ({ query, categoryId }: Props) => {
  const isMobile = useIsMobile();

  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      query,
      categoryId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (!results.pages[0].videosWithReactions) {
    return <p className="m-4 text-center text-lg">No results found</p>;
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
          <p className="m-4 text-center text-lg">No results found</p>
        )
      ) : results.pages[0].videosWithReactions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {results.pages.flatMap((page) =>
            page?.videosWithReactions?.map((video) => (
              <VideoRowCard key={video.id} data={video} size="default" />
            ))
          )}

          <InfiniteScroll
            fetchNextPage={resultsQuery.fetchNextPage}
            isFetchingNextPage={resultsQuery.isFetchingNextPage}
            hasNextPage={resultsQuery.hasNextPage}
          />
        </div>
      ) : (
        <p className="m-4 text-center text-lg">No results found</p>
      )}
    </>
  );
};

const ResultsSection = ({ query, categoryId }: Props) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error.</p>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default ResultsSection;
