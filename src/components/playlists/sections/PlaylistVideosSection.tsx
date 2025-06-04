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
import { useClerk } from "@clerk/nextjs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

const PlaylistVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 sm:hidden">
        {[...new Array(18)].fill(0).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 gap-y-10 sm:flex">
        {[...new Array(18)].fill(0).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

interface Props {
  playlistId: string;
}

const PlaylistVideosSectionSuspense = ({ playlistId }: Props) => {
  const isMobile = useIsMobile();

  const utils = trpc.useUtils();
  const clerk = useClerk();

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      utils.playlists.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
    },
    onError: (error) => {
      toast.error("Failed to add ");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const [results, resultsQuery] =
    trpc.playlists.getPlaylistVideos.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        playlistId,
      },

      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  if (!results.pages[0].playlistVideosWithReactions) {
    return (
      <p className="m-4 text-muted-foreground text-center text-lg">
        No videos in this playlist
      </p>
    );
  }

  return (
    <>
      {isMobile ? (
        results.pages[0].playlistVideosWithReactions?.length > 0 ? (
          <div className="flex flex-col gap-4 gap-y-10">
            {results.pages.flatMap((page) =>
              page?.playlistVideosWithReactions?.map((video) => (
                <VideoGridCard
                  data={video}
                  key={video.id}
                  onRemove={() =>
                    removeVideo.mutate({ videoId: video.id, playlistId })
                  }
                />
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
      ) : results.pages[0].playlistVideosWithReactions.length > 0 ? (
        <div>
          <div className="flex flex-col gap-4 gap-y-10">
            {results.pages.flatMap((page) =>
              page?.playlistVideosWithReactions?.map((video) => (
                <VideoRowCard
                  data={video}
                  key={video.id}
                  onRemove={() =>
                    removeVideo.mutate({ videoId: video.id, playlistId })
                  }
                />
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

const PlaylistVideosSection = ({ playlistId }: Props) => {
  return (
    <Suspense fallback={<PlaylistVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <PlaylistVideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistVideosSection;
