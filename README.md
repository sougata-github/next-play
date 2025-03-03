## Create a tRPC client for Client Components

The trpc/client.tsx is the entrypoint when consuming your tRPC API from client components. In here, import the type definition of your tRPC router and create typesafe hooks using createTRPCReact.

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

- Fetch and serialize data on the server.

- Send the serialized data to the client.

- On the client → `<HydrateClient>` deserializes and restores the data into React Query's cache.

Hydrating the data means restoring `pre-fetched` or `serialized data` back into its original format on the client-side so it can be used efficiently.

Serialization is the process of converting complex data structures (like objects, arrays, dates, or custom classes) into a format that can be easily stored, transferred, or processed—typically into a string (JSON, binary, etc.).

Since we are prefetching data in page.tsx, Next.js will consider it static, so we must declare `export const dynamic = "force-dynamic"`.

Advantages:

- trpc.hello.prefetch() ensures that the query result is cached and hydrated into the Client Component.

- When the Client Component mounts and calls `useSuspenseQuery`, it instantly gets the preloaded data from the cache instead of making another request.

- No unnecessary loading state in the Client Component (which would be the case if we use useQuery and isLoading in Client Component)

- Hydrate Client in the same component/page where you are prefetching data.

## tRPC Configuration

- Enable transformer on tRPC✅
- Add auth to tRPC context✅
- Add protectedProcedure✅
- Add rate limiting (using upstash)✅

## Video Categories

- Create categories schema
- Push changes to db
- Seed categories
- Organise tRPC routers
- Prefetch categories
- Create categories component
