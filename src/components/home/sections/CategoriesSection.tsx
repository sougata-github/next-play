"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import FilterCarousel from "../FilterCarousel";
import { useRouter } from "next/navigation";

interface Props {
  categoryId?: string;
}

const CategoriesSectionSuspense = ({ categoryId }: Props) => {
  const router = useRouter();

  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map(({ name, id }) => ({
    value: id,
    label: name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }

    router.push(url.toString());
  };

  return (
    <div>
      <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />
    </div>
  );
};

const CategoriesSection = ({ categoryId }: Props) => {
  return (
    <Suspense
      fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}
    >
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default CategoriesSection;
