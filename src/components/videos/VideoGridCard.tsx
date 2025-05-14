import { VideoGetManyOutput } from "@/types";
import Link from "next/link";

import VideoThumbnail from "./VideoThumbnail";
import VideoInfo from "./VideoInfo";

interface Props {
  data: VideoGetManyOutput["videosWithReactions"][number];
  onRemove?: () => void;
}

const VideoGridCard = ({ data, onRemove }: Props) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${data.id}`}>
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
