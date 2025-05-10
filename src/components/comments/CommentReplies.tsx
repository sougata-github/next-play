"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader } from "lucide-react";
import CommentItem from "./CommentItem";
import { Button } from "../ui/button";

interface Props {
  parentId: string;
  videoId: string;
}

const CommentReplies = ({ parentId, videoId }: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.comments.getMany.useInfiniteQuery(
      {
        videoId,
        parentId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <div className="pl-14">
      <div className="flex flex-col gap-4 mt-4">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader className="size-4 animate-spin transition text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages.flatMap((page) =>
            page.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} variant="reply" />
            ))
          )}
      </div>
      {hasNextPage && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <CornerDownRightIcon />
          Show more replies
        </Button>
      )}
    </div>
  );
};

export default CommentReplies;
