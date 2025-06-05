import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { VideoGetOneOutput } from "@/types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

interface Props {
  videoId: VideoGetOneOutput["existingVideo"]["id"];
  likes: VideoGetOneOutput["likeCount"];
  dislikes: VideoGetOneOutput["dislikeCount"];
  viewerReactions: VideoGetOneOutput["viewerReactions"];
}

const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReactions,
}: Props) => {
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate();
      utils.playlists.getManyLiked.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div className="flex items-center flex-none">
      <Button
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        variant="secondary"
        disabled={like.isPending || dislike.isPending}
        onClick={() => like.mutate({ videoId })}
      >
        <ThumbsUpIcon
          className={cn(
            "size-5",
            viewerReactions?.type === "LIKE" && "fill-black dark:fill-white"
          )}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        className="rounded-l-none rounded-r-full pl-3"
        variant="secondary"
        disabled={like.isPending || dislike.isPending}
        onClick={() => dislike.mutate({ videoId })}
      >
        <ThumbsDownIcon
          className={cn(
            "size-5",
            viewerReactions?.type === "DISLIKE" && "fill-black dark:fill-white"
          )}
        />
        {dislikes}
      </Button>
    </div>
  );
};

export default VideoReactions;
