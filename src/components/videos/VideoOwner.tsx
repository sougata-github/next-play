import { useSubscription } from "@/hooks/useSubscription";
import { VideoGetOneOutput } from "@/types";
import { displayCount } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import SubscriptionButton from "../subscriptions/SubscriptionButton";
import UserInfo from "../users/UserInfo";
import UserAvatar from "../UserAvatar";
import { Button } from "../ui/button";

interface Props {
  isSubscribed: VideoGetOneOutput["isSubscribed"];
  subscriberCount: VideoGetOneOutput["subscriberCount"];
  user: VideoGetOneOutput["existingVideo"]["user"];
  videoId: VideoGetOneOutput["existingVideo"]["id"];
}

const VideoOwner = ({
  isSubscribed,
  subscriberCount,
  user,
  videoId,
}: Props) => {
  const { userId } = useAuth();

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size="lg" name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {subscriberCount} {displayCount(subscriberCount, "subscriber")}
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button className="rounded-full" asChild variant="secondary">
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending}
          isSubscribed={isSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};

export default VideoOwner;
