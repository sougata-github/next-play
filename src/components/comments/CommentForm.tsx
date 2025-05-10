"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import UserAvatar from "../UserAvatar";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { commentsSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

interface Props {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

const CommentForm = ({
  videoId,
  onSuccess,
  parentId,
  variant = "comment",
  onCancel,
}: Props) => {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof commentsSchema>>({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      content: "",
    },
  });

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      toast.success(`${parentId ? "Reply added" : "Comment added"}`);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Couldn't add comment");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const onSubmit = (values: z.infer<typeof commentsSchema>) => {
    const { content } = values;
    createComment.mutate({ parentId, videoId, content });
  };

  return (
    <Form {...form}>
      <form className="flex gap-4 group" onSubmit={form.handleSubmit(onSubmit)}>
        {!isLoaded ? (
          <Skeleton className="size-10 rounded-full" />
        ) : (
          <UserAvatar
            size="lg"
            imageUrl={user?.imageUrl || "/user-placeholder.svg"}
            name={user?.username || ""}
          />
        )}
        <div className="flex-1">
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply"
                        ? "Reply to this comment"
                        : "Add a comment..."
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={createComment.isPending}>
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
