"use client";

import CommentForm from "@/components/comments/CommentForm";
import CommentItem from "@/components/comments/CommentItem";
import InfiniteScroll from "@/components/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { displayCount } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  videoId: string;
}

export const CommentsSkeleton = () => {
  return (
    <div className="mt-6 flex">
      <Skeleton className="h-8 rounded-lg" />
    </div>
  );
};

const CommentsSectionSuspense = ({ videoId }: Props) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  //static for every page
  const totalComments = comments.pages[0].totalComments;

  return (
    <div className="mt-6 ">
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold">
          {totalComments} {displayCount(totalComments, "Comment")}
        </h1>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.pages.flatMap((page) =>
            page.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
          <InfiniteScroll
            fetchNextPage={query.fetchNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            hasNextPage={query.hasNextPage}
          />
        </div>
      </div>
    </div>
  );
};

const CommentsSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<CommentsSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default CommentsSection;
