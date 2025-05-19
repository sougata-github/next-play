import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      // If there's no query, return 0 videos
      if (!query || query.trim() === "") {
        return {
          items: [],
          nextCursor: null,
        };
      }

      const category = await db.category.findFirst({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const data = await db.video.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            ...(category
              ? [
                  {
                    categoryId: category.id,
                  },
                ]
              : []),
          ],
          ...(categoryId && {
            categoryId,
          }),
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
