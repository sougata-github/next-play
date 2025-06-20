"use client";

import { trpc } from "@/trpc/client";
import ResponsiveModal from "../ResponsiveModal";
import { DEFAULT_LIMIT } from "@/constants";
import { SquareCheckIcon, SquareIcon } from "lucide-react";
import { Button } from "../ui/button";
import InfiniteScroll from "../InfiniteScroll";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";

interface Props {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlaylistAddModal = ({ videoId, open, onOpenChange }: Props) => {
  const utils = trpc.useUtils();

  const clerk = useClerk();

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video added to playlist");
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

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate();
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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        videoId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );

  return (
    <ResponsiveModal
      title="Add to Playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[
              ...new Array(2).fill(0).map((_, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <Skeleton className="rounded h-4 w-4" />
                  <Skeleton className="rounded-full h-4 w-full" />
                </div>
              )),
            ]}
          </div>
        )}
        {!isLoading &&
        data?.pages[0].playlistsWithHasVideo &&
        data?.pages[0].playlistsWithHasVideo.length > 0 ? (
          <>
            {data?.pages.flatMap((page) =>
              page.playlistsWithHasVideo.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start px-2 [&_svg]:size-5"
                  size="lg"
                  onClick={() => {
                    if (playlist.hasVideo) {
                      removeVideo.mutate({
                        playlistId: playlist.id,
                        videoId: videoId,
                      });
                    } else {
                      addVideo.mutate({
                        playlistId: playlist.id,
                        videoId: videoId,
                      });
                    }
                  }}
                  disabled={addVideo.isPending || removeVideo.isPending}
                >
                  {playlist.hasVideo ? (
                    <SquareCheckIcon className="mr-2" />
                  ) : (
                    <SquareIcon className="mr-2" />
                  )}
                  {playlist.name}
                </Button>
              ))
            )}
            {!isLoading && (
              <InfiniteScroll
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                isManual
              />
            )}
          </>
        ) : (
          !isLoading && (
            <p className="m-4 text-center text-lg font-medium text-muted-foreground/40">
              Start creating some playlists
            </p>
          )
        )}
      </div>
    </ResponsiveModal>
  );
};

export default PlaylistAddModal;
