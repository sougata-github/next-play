import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface Props {
  title: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  duration: number;
}

const VideoThumbnail = ({ title, imageUrl, previewUrl, duration }: Props) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-lg aspect-video">
        <Image
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0 transition-all"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl ?? "/placeholder.svg"}
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
