import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
  getManyHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            viewedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const data = await db.view.findMany({
        where: {
          userId,
          ...(cursor && {
            OR: [
              {
                createdAt: {
                  lt: cursor.viewedAt,
                },
              },
              {
                createdAt: cursor.viewedAt,
                id: {
                  lt: cursor.id,
                },
              },
            ],
          }),
        },
        //sort by latest view
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: {
          video: {
            include: {
              user: true,
            },
          },
        },
      });

      const hasMore = data.length > limit;

      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      const videosWithReactions = await Promise.all(
        items.map(async (view) => {
          const [likeCount, dislikeCount] = await Promise.all([
            db.reaction.count({
              where: {
                videoId: view.videoId,
                type: "LIKE",
              },
            }),
            db.reaction.count({
              where: {
                videoId: view.videoId,
                type: "DISLIKE",
              },
            }),
          ]);

          return { ...view.video, likeCount, dislikeCount };
        })
      );

      //update cursor
      const lastView = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastView.id,
            viewedAt: lastView.createdAt,
          }
        : null;

      return {
        videosWithReactions,
        nextCursor,
      };
    }),
  getManyLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            likedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const data = await db.reaction.findMany({
        where: {
          type: "LIKE",
          userId,
          ...(cursor && {
            OR: [
              {
                createdAt: {
                  lt: cursor.likedAt,
                },
              },
              {
                createdAt: cursor.likedAt,
                id: {
                  lt: cursor.id,
                },
              },
            ],
          }),
        },
        //sort by latest liked
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: {
          video: {
            include: {
              user: true,
            },
          },
        },
      });

      const hasMore = data.length > limit;

      const items = hasMore ? data.slice(0, -1) : data;

      const videosWithReactions = await Promise.all(
        items.map(async (reaction) => {
          const [likeCount, dislikeCount] = await Promise.all([
            db.reaction.count({
              where: {
                videoId: reaction.videoId,
                type: "LIKE",
              },
            }),
            db.reaction.count({
              where: {
                videoId: reaction.videoId,
                type: "DISLIKE",
              },
            }),
          ]);

          return { ...reaction.video, likeCount, dislikeCount };
        })
      );

      //update cursor
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            likedAt: lastItem.createdAt,
          }
        : null;

      return {
        videosWithReactions,
        nextCursor,
      };
    }),
});
