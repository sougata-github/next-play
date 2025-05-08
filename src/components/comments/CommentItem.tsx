import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { CommentsGetManyOutput } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "../UserAvatar";
import { Button } from "../ui/button";

interface Props {
  comment: CommentsGetManyOutput["comments"][number];
}

const CommentItem = ({ comment }: Props) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const { userId } = useAuth();

  const remove = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.comments.getMany.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete comment.");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size="lg"
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center mt-1 gap-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                disabled={like.isPending || dislike.isPending}
                onClick={() => like.mutate({ commentId: comment.id })}
                className="size-8"
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReactions?.type === "LIKE" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={like.isPending || dislike.isPending}
                onClick={() => dislike.mutate({ commentId: comment.id })}
                className="size-8"
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReactions?.type === "DISLIKE" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>
            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CommentItem;
