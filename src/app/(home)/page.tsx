import HomeView from "@/components/home/views/HomeView";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}
