import { ListVideoIcon, PlayIcon } from "lucide-react";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { PlaylistsGetManyOutput } from "@/types";
import { cn, displayCount } from "@/lib/utils";
import { useMemo } from "react";
import Image from "next/image";

import { Skeleton } from "../ui/skeleton";

interface Props {
  imageUrl?: string | null;
  className?: string;
  title: PlaylistsGetManyOutput["playlistsWithThumbnail"][number]["name"];
  videoCount: PlaylistsGetManyOutput["playlistsWithThumbnail"][number]["_count"]["videos"];
}

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

const PlaylistThumbnail = ({
  imageUrl,
  title,
  videoCount,
  className,
}: Props) => {
  const compactVideoCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(videoCount);
  }, [videoCount]);

  return (
    <div className={cn("relative pt-3", className)}>
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />
      </div>

      <div className="relative overflow-hidden w-full rounded-xl aspect-video">
        <Image
          fill
          src={imageUrl || THUMBNAIL_FALLBACK}
          alt={title}
          className="size-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-x-2">
            <PlayIcon className="size-4 text-white fill-white" />
            <span className="text-white font-medium">Play All</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4" />
        {compactVideoCount} {displayCount(Number(compactVideoCount), "video")}
      </div>
    </div>
  );
};

export default PlaylistThumbnail;
