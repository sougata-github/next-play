import { videoReactionsRouter } from "@/server/procedures/reactions";
import { categoriesRouter } from "@/server/procedures/categories";
import { videoViewsRouter } from "@/server/procedures/views";
import { videosRouter } from "@/server/procedures/videos";
import { studioRouter } from "@/server/procedures/studio";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
