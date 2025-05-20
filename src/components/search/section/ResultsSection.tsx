"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import VideoGridCard, {
  VideoGridCardSkeleton,
} from "@/components/videos/VideoGridCard";
import VideoRowCard, {
  VideoRowCardSkeleton,
} from "@/components/videos/VideoRowCard";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  query: string | undefined;
  categoryId: string | undefined;
}

const ResultsSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden flex-col gap-4 md:flex">
        {[...new Array(5)].fill(0).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
      <div className="flex flex-col gap-4 p-4 md:hidden">
        {[...new Array(5)].fill(0).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

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
    return (
      <p className="m-4 text-muted-foreground text-center text-lg">
        No results found
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
            No results found
          </p>
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
        <p className="m-4 text-muted-foreground/40 text-center text-lg font-medium">
          No results found
        </p>
      )}
    </>
  );
};

const ResultsSection = ({ query, categoryId }: Props) => {
  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>Error.</p>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default ResultsSection;
