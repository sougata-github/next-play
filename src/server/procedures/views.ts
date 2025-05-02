import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const existingVideoView = await db.view.findFirst({
        where: {
          userId,
          videoId,
        },
      });

      if (existingVideoView) {
        return existingVideoView;
      }

      //else create a view
      const createdVideoView = await db.view.create({
        data: {
          userId,
          videoId,
        },
      });

      return createdVideoView;
    }),
});
