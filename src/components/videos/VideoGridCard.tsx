import { VideoGetManyOutput } from "@/types";
import Link from "next/link";

import VideoThumbnail, { VideoThumbnailSkeleton } from "./VideoThumbnail";
import VideoInfo, { VideoInfoSkeleton } from "./VideoInfo";

interface Props {
  data: VideoGetManyOutput["videosWithReactions"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

const VideoGridCard = ({ data, onRemove }: Props) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};

export default VideoGridCard;
