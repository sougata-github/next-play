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

- Serialization is the process of converting complex data structures (like objects, arrays, dates, or custom classes) into a format that can be easily stored, transferred, or processed—typically into a string (JSON, binary, etc.).

- Since we are prefetching data in page.tsx, Next.js will consider it static, so we must declare `export const dynamic = "force-dynamic"`.

- Hydrate Client in the same component/page where you are prefetching data.

- When using `prefetchInfinite` in page.tsx, use `useSuspenseInfiniteQuery` in corresponding client component.

Advantages:

- trpc.hello.prefetch() ensures that the query result is cached and hydrated into the Client Component.

- When the Client Component mounts and calls `useSuspenseQuery`, it instantly gets the preloaded data from the cache instead of making another request.

- No unnecessary loading state in the Client Component (which would be the case if we use useQuery and isLoading in Client Component)

## tRPC Configuration

- Enable transformer on tRPC✅
- Add auth to tRPC context✅
- Add protectedProcedure✅
- Add rate limiting (using upstash)✅

## Video Categories

- Create categories schema✅
- Push changes to db✅
- Seed categories✅
- Organise tRPC routers✅
- Prefetch categories✅
- Create categories component✅

## Stuido layout

- Create studio route group✅
- Create studio layout✅
- Protect studio routes✅

## Studio Videos

- Create videos schema✅
- Push db changes✅
- Create studio procedures✅
- Add video record creation✅

## Infinite Loading

- Add Suspense and error boundaries✅
- Create reusable InfiniteScroll component✅
- Demonstrate infinite scroll✅

## Mux Integration

- Create Responsive Dialog✅
- Create a free Mux account✅
- Get a 15-second video✅
- Create upload modal✅

When we upload a video, it takes time to process, hence webhooks and since webhooks are anonymous, we need a way to preserve which user has uploaded, hence `userId` (metadata) to `passthrough`.

When we create a video, we also generate an upload url using Mux. We send this back to the Uploader and use it as an endpoint. After we upload the video, the webhook with `video.asset.created` is triggered and we update the video with the `upload url` (muxUploadId) record in our db with the status and asset id received from mux payload.

## Mux Webhooks

- Update video schema✅
- Push db changes✅
- Handle `video.asset.ready` event✅
  - assign thumbnail
  - assign preview
- Handle `video.asset.errored` event✅
  - update status
- Handle `video.asset.deleted` event✅
  - delete from db
- Handle `video.asset.track.ready` event✅
  - update trackId and trackStatus

## Video Form

- Add Skeleton to videos-section✅
- Create video form page✅
- Create video player✅
- Add ability to update video information✅
  - Title, Description, Category, Visibility✅

## Video Thumbnails

- Integrate UploadThing✅
- Add thumbnail upload functionality✅
- Add thumbnail restore functionality✅
- Refactor thumbnail fields in the schema✅
  - Proper UploadThing cleanup✅

Unified approach to uploading files. Every file should be on `uploadthing`.

when creating/restoring a video:

get mux asset url (temp thumbnail) -> upload to uploadthing using utapi -> get url from uploadthing -> update db.

optimisation for future: load the entire form element until video is ready. use video.preparing for that. Show an overlay on top of the form.

## AI background jobs

Why background jobs?

- Avoid timeout from long-running tasks
  - problematic with AI integrations
- Ensure retries in case of failure

- Integrate Upstash workflow✅
- Trigger a background job✅
- Add AI using vercel SDK✅
- Add background jobs✅

  - Generate title✅
  - Generate description✅
  - Generate thumbnail✅

## AI Thumbnails

- Create thumbnail prompt modal✅
- Create thumbail generation workflow✅
- Add Skeleton to form-section loading state✅

## Video Page

- Create video "getOne" procedure✅
  - inner-join "user" (author information)
- Prefetching process✅
- Video section✅
- Comments section (Placeholder)✅
- Suggestions section (Placeholder)✅

## Video Views

- Create video views schema✅
- Combine video views for "getOne" videos procedure✅
- Create video views creation procedure✅
- Trigger video view creation on video play✅

## Video reactions

- Create video reactions schema✅
- Combine video reactions for "getOne" videos procedure✅
- Create video reactions like & dislike procedure✅
- Connect VideoReactions component with new API✅

## Subscriptions

- Create subscriptions schema✅
- Combine subscriptions for "getOne" videos procedure✅
- Create subscriptions procedures✅
- Create SubscriptionButton component with new API✅

## Comments

- Create comments schema✅
- Create comments procedures✅
- Create comments section✅

## Comments Infinite Loading

- Modify comments "getMany" procedure✅
- Change prefect() to prefecthInfinte()✅
- Change suspense() to useSuspenseInfiniteQuery()✅
- Add InfiniteLoading component✅

## Comment Reactions

- Add "commentReactions" schema✅
- Create comment reactions UI✅
- Combine "commentReactions" with comments "getMany" procedure✅

## Comment Replies

- Extend comment schema by adding "parentId" foreign key✅
- Create UI for replies✅
- Modify comments "getMany" procedure by combining parentId✅
- Create variants for "CommentItem" component✅
- Create variants for "CommentForm" component✅
- Create CommentReplies component✅

## Suggestions

- Create suggestions procedure✅
- Prefetch suggestions✅
- Create VideoRowCard and VideoGrid components✅
- Connect Suggestions section with new API✅

## Search Page

- Add manual video re-validation✅
  - in case webhook fail
  - in case webhooks fire out of order
- Add proper categoryId query to suggestions✅
- Create search procedure✅
- Prefecth searcg page✅
- Connect search section to API✅

## Home Feed

- Create videos procedures✅
- Add Home page✅
- Add Trending page✅
- Add Subscriptions page✅
