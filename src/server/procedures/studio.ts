import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const video = await db.video.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return video;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        //cursor will be used to track from where to start quering
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db.video.findMany({
        where: {
          userId,
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
              comments: true,
              views: true,
            },
          },
        },
      });

      const hasMore = data.length > limit;

      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      const videosWithLikeCount = await Promise.all(
        items.map(async (video) => {
          const likeCount = await db.reaction.count({
            where: {
              videoId: video.id,
              type: "LIKE",
            },
          });
          return { ...video, likeCount };
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
        videosWithLikeCount,
        nextCursor,
      };
    }),
});
