import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const existingUser = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!existingUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const data = await db.subscription.findMany({
        where: {
          viewerId: existingUser.id,
          ...(cursor && {
            OR: [
              {
                updatedAt: {
                  lt: cursor.updatedAt,
                },
              },
              {
                updatedAt: cursor.updatedAt,
                creatorId: {
                  lt: cursor.creatorId,
                },
              },
            ],
          }),
        },
        orderBy: [{ createdAt: "desc" }, { creatorId: "desc" }],
        take: limit + 1,
        include: {
          creator: {
            include: {
              _count: {
                select: {
                  subscribers: true,
                },
              },
            },
          },
        },
      });

      const hasMore = data.length > limit;

      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            creatorId: lastItem.creatorId,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  subscribe: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const subscription = await db.subscription.create({
        data: {
          viewerId: ctx.user.id,
          creatorId: userId,
        },
      });

      return subscription;
    }),
  unsubscribe: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const deletedSubscription = await db.subscription.delete({
        where: {
          viewerId_creatorId: {
            viewerId: ctx.user.id,
            creatorId: userId,
          },
        },
      });

      return deletedSubscription;
    }),
});
