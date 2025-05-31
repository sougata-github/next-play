"use client";

import InfiniteScroll from "@/components/InfiniteScroll";

import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import PlaylistGridCard, {
  PlaylistGridCardSkeleton,
} from "../PlaylistGridCard";

const PlaylistsSectionSkeleton = () => {
  return (
    <div>
      <div className="gap-4 gap-y-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {[...new Array(18)].fill(0).map((_, index) => (
          <PlaylistGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const PlaylistsSectionSuspense = () => {
  const isMobile = useIsMobile();

  const [results, resultsQuery] =
    trpc.playlists.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  if (!results.pages[0].playlistsWithThumbnail) {
    return (
      <p className="m-4 text-muted-foreground text-center text-lg">
        Start creating some playlists
      </p>
    );
  }

  return (
    <>
      {isMobile ? (
        results.pages[0].playlistsWithThumbnail?.length > 0 ? (
          <div className="flex flex-col gap-4 gap-y-10">
            {results.pages.flatMap((page) =>
              page?.playlistsWithThumbnail?.map((playlist) => (
                <PlaylistGridCard playlist={playlist} key={playlist.id} />
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
            Start creating some playlists
          </p>
        )
      ) : results.pages[0].playlistsWithThumbnail.length > 0 ? (
        <div>
          <div className="gap-4 gap-y-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
            {results.pages.flatMap((page) =>
              page?.playlistsWithThumbnail?.map((playlist) => (
                <PlaylistGridCard playlist={playlist} key={playlist.id} />
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
          Start creating some playlists
        </p>
      )}
    </>
  );
};

const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistsSection;
