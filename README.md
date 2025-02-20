## Create a tRPC client for Client Components

he trpc/client.tsx is the entrypoint when consuming your tRPC API from client components. In here, import the type definition of your tRPC router and create typesafe hooks using createTRPCReact.

## Create a tRPC caller for Server Components

To prefetch queries from server components, we use a tRPC caller. The `@trpc/react-query/rsc` module exports a thin wrapper around `createCaller` that integrates with your React Query client.

## Hybrid data fetching pattern using both RSC & Client Components

Here we leverage the speed of `server component` to prefetch data and let the `client component` not have to fetch anything initially. It will have the data ready

Server Component (prefetching data)

```typescript
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

import { PageClient } from "./client";

export default async function Home() {
  void trpc.hello.prefetch({ text: "Next.js" });

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error...</p>}>
          <PageClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
```

Client Component (with ready prefetched data)

```typescript
"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({
    text: "Next.js",
  });

  return <div>{data.greeting}</div>;
};
```

So in this approach, the data is fetched once on the server and hydrated into the Client Component.

Advantages:

- trpc.hello.prefetch() ensures that the query result is cached and hydrated into the Client Component.
- When the Client Component mounts and calls `useSuspenseQuery`, it instantly gets the preloaded data from the cache instead of making another request.
- No unnecessary loading state in the Client Component.
