import HomeView from "@/components/home/views/HomeView";
import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function VideosPage({ searchParams }: Props) {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}
