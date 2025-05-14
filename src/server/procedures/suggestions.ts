import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const exisitingVideo = await db.video.findUnique({
        where: {
          id: videoId,
        },
      });

      if (!exisitingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const data = await db.video.findMany({
        where: {
          ...(exisitingVideo.categoryId && {
            categoryId: exisitingVideo.categoryId,
          }),
          // NOT: {
          //   id: exisitingVideo.id,
          // },
          ...(cursor && {
            OR: [
              {
                updatedAt: {
                  lt: cursor.updatedAt,
                },
              },
              {
                updatedAt: cursor.updatedAt,
                id: {
                  lt: cursor.id,
                },
              },
            ],
          }),
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1, // add one to check if more data exists
        include: {
          _count: {
            select: {
              views: true,
            },
          },
          user: true,
        },
      });

      const hasMore = data.length > limit;

      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      const videosWithReactions = await Promise.all(
        items.map(async (video) => {
          const [likeCount, dislikeCount] = await Promise.all([
            db.reaction.count({
              where: {
                videoId: video.id,
                type: "LIKE",
              },
            }),
            db.reaction.count({
              where: {
                videoId: video.id,
                type: "DISLIKE",
              },
            }),
          ]);

          return { ...video, likeCount, dislikeCount };
        })
      );

      //update cursor
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        videosWithReactions,
        nextCursor,
      };
    }),
});
