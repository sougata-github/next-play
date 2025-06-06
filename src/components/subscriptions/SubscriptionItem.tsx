import { SubscriptionsGetManyOutput } from "@/types";
import { displayCount } from "@/lib/utils";

import SubscriptionButton from "./SubscriptionButton";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../UserAvatar";

interface Props {
  name: SubscriptionsGetManyOutput["items"][number]["creator"]["name"];
  imageUrl: SubscriptionsGetManyOutput["items"][number]["creator"]["imageUrl"];
  subscriberCount: SubscriptionsGetManyOutput["items"][number]["creator"]["_count"]["subscribers"];
  onUnsubscribe: () => void;
  disabled: boolean;
}

export const SubscriptionItemSkeleton = () => {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="size-10 rounded-full" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const SubscriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubscribe,
  disabled,
}: Props) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar name={name} imageUrl={imageUrl} size="lg" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {subscriberCount.toLocaleString()}{" "}
              {displayCount(subscriberCount, "subscriber")}
            </p>
          </div>

          <SubscriptionButton
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe();
            }}
            disabled={disabled}
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionItem;
