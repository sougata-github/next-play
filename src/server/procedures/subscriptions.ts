import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
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
