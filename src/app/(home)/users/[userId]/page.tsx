import UserView from "@/components/users/views/UserView";
import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";

interface Props {
  params: Promise<{ userId: string }>;
}

export const dynamic = "force-dynamic";

export default async function UserPage({ params }: Props) {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({
    userId,
  });

  void trpc.videos.getMany.prefetchInfinite({
    userId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
}
