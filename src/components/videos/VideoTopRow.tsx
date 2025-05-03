import { format, formatDistanceToNow } from "date-fns";
import { VideoGetOneOutput } from "@/types";
import { useMemo } from "react";

import VideoDescription from "./VideoDescription";
import VideoReactions from "./VideoReactions";
import VideoOwner from "./VideoOwner";
import VideoMenu from "./VideoMenu";

interface Props {
  video: VideoGetOneOutput;
}

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
