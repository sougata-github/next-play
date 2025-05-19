import SearchView from "@/components/search/views/SearchView";
import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { query, categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.search.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    query,
    categoryId,
  });

  return (
    <HydrateClient>
      <SearchView categoryId={categoryId} query={query} />
    </HydrateClient>
  );
}
