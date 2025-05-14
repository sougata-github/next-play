import { cva, VariantProps } from "class-variance-authority";
import { cn, displayCount } from "@/lib/utils";
import { VideoGetManyOutput } from "@/types";
import { useMemo } from "react";
import Link from "next/link";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import VideoThumbnail from "./VideoThumbnail";
import { Skeleton } from "../ui/skeleton";
import UserInfo from "../users/UserInfo";
import UserAvatar from "../UserAvatar";
import VideoMenu from "./VideoMenu";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface Props extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["videosWithReactions"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = () => {
  return (
    <div>
      <Skeleton />
    </div>
  );
};

const VideoRowCard = ({ data, size, onRemove }: Props) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data._count.views);
  }, [data._count.views]);

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount);
  }, [data.likeCount]);

  return (
    <div className={videoRowCardVariants({ size })}>
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} {displayCount(data._count.views, "view")} •{" "}
                {compactLikes} {displayCount(data.likeCount, "like")}
              </p>
            )}
            {size === "default" && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size="sm"
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size="sm" name={data.user.name} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {data.description ?? "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p>From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && <UserInfo size="sm" name={data.user.name} />}
            {size === "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {compactViews} {displayCount(data._count.views, "view")} •{" "}
                {compactLikes} {displayCount(data.likeCount, "like")}
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRowCard;
