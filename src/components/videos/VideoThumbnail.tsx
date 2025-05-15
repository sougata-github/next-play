import { THUMBNAIL_FALLBACK } from "@/constants";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

import { Skeleton } from "../ui/skeleton";

interface Props {
  title: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  duration: number;
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

const VideoThumbnail = ({ title, imageUrl, previewUrl, duration }: Props) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-lg aspect-video">
        <Image
          src={imageUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0 transition-all"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-100 opacity-0 transition-all"
        />
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
};

export default VideoThumbnail;
