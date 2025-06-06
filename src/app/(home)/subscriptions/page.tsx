import SubscriptionsView from "@/components/subscriptions/views/SubscriptionsView";
import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
}
