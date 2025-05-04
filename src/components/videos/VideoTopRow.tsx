import { format, formatDistanceToNow } from "date-fns";
import { VideoGetOneOutput } from "@/types";
import { useMemo } from "react";

import VideoDescription from "./VideoDescription";
import VideoReactions from "./VideoReactions";
import { Skeleton } from "../ui/skeleton";
import VideoOwner from "./VideoOwner";
import VideoMenu from "./VideoMenu";

interface Props {
  video: VideoGetOneOutput;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-4/5 md:w-2/5" />
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 w-[70%]">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-5 w-4/5 md:w-2/6" />
            <Skeleton className="h-5 w-4/5 md:w-1/5" />
          </div>
        </div>
        <Skeleton className="h-9 w-2/6 md:1/6 rounded-full" />
      </div>
      <div className="h-[120px] w-full" />
    </div>
  );
};

const VideoTopRow = ({ video }: Props) => {
  const { existingVideo, subscriberCount, isSubscribed } = video;

  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(existingVideo._count.views);
  }, [existingVideo._count.views]);

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(existingVideo._count.views);
  }, [existingVideo._count.views]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(existingVideo.createdAt, { addSuffix: true });
  }, [existingVideo.createdAt]);

  const expandedDate = useMemo(() => {
    return format(existingVideo.createdAt, "d MMM yyyy");
  }, [existingVideo.createdAt]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{existingVideo.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner
          isSubscribed={isSubscribed}
          subscriberCount={subscriberCount}
          user={existingVideo.user}
          videoId={existingVideo.id}
        />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:m-0 gap-2">
          <VideoReactions
            videoId={existingVideo.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReactions={video.viewerReactions}
          />
          <VideoMenu videoId={existingVideo.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        views={existingVideo._count.views}
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={existingVideo.description}
      />
    </div>
  );
};

export default VideoTopRow;
