import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export function useSubscription({ userId, isSubscribed, fromVideoId }: Props) {
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.subscribe.useMutation({
    //todo: invalidate subscriptions.getMany, users.getOne
    onSuccess: () => {
      toast.success("Subscribed");
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ videoId: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Couldn't subscribe");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const unscubscribe = trpc.subscriptions.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ videoId: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Couldn't unsubscribe");

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subscribe.isPending || unscubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unscubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return { isPending, onClick };
}
