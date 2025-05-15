import { formatDistanceToNow } from "date-fns";
import { VideoGetManyOutput } from "@/types";
import { displayCount } from "@/lib/utils";
import { useMemo } from "react";
import Link from "next/link";

import { Skeleton } from "../ui/skeleton";
import UserInfo from "../users/UserInfo";
import UserAvatar from "../UserAvatar";
import VideoMenu from "./VideoMenu";

interface Props {
  data: VideoGetManyOutput["videosWithReactions"][number];
  onRemove?: () => void;
}

export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  );
};

const VideoInfo = ({ data, onRemove }: Props) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data._count.views);
  }, [data._count.views]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(data.createdAt, {
      addSuffix: true,
    });
  }, [data.createdAt]);

  return (
    <div className="flex gap-3 mt-1">
      <Link href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {compactViews} {displayCount(data._count.views, "view")} •{" "}
            {compactDate}{" "}
          </p>
        </Link>
      </div>
      <div className="shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  );
};

export default VideoInfo;
