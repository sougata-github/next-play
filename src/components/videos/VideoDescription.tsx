import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn, displayCount } from "@/lib/utils";
import { VideoGetOneOutput } from "@/types";
import { useState } from "react";

import { Skeleton } from "../ui/skeleton";

interface Props {
  views: VideoGetOneOutput["existingVideo"]["_count"]["views"];
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
  description?: string | null;
}

export const VideoDescriptionSkeleton = () => {
  return <Skeleton className="-mt-28 rounded-xl h-20 w-full" />;
};

const VideoDescription = ({
  views,
  compactViews,
  expandedViews,
  compactDate,
  expandedDate,
  description,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      <div className="flex gap-2 text-sm mb-2">
        <span className="font-medium">
          {isExpanded ? expandedViews : compactViews}{" "}
          {displayCount(views, "view")}
        </span>
        <span className="font-medium">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>
      <div className="relative">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap",

            !isExpanded && "line-clamp-2"
          )}
        >
          {description || "No description"}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-4 text-sm font-medium">
        {isExpanded ? (
          <>
            Show less <ChevronUpIcon className="size-4" />
          </>
        ) : (
          <>
            Show More <ChevronDownIcon className="size-4" />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoDescription;
