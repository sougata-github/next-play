"use client";

import CommentForm from "@/components/comments/CommentForm";
import CommentItem from "@/components/comments/CommentItem";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  videoId: string;
}

const CommentsSectionSuspense = ({ videoId }: Props) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({
    videoId,
  });

  return (
    <div className="mt-6 ">
      <div className="flex flex-col gap-6">
        <h1>{comments.length} Comments</h1>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem comment={comment} key={comment.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentsSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default CommentsSection;
