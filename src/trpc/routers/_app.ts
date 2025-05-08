import { commentReactionsRouter } from "@/server/procedures/commentReactions";
import { subscriptionsRouter } from "@/server/procedures/subscriptions";
import { videoReactionsRouter } from "@/server/procedures/reactions";
import { categoriesRouter } from "@/server/procedures/categories";
import { commentsRouter } from "@/server/procedures/comments";
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
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
