import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const { clerkUserId } = ctx;

      let viewerId: string | undefined = undefined;

      if (clerkUserId) {
        const user = await db.user.findUnique({
          where: {
            clerkId: clerkUserId,
          },
        });

        viewerId = user?.id;
      }

      const existingUser = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          _count: {
            select: {
              subscriptions: true,
              subscribers: true,
              videos: true,
            },
          },
          subscriptions: true,
          subscribers: true,
        },
      });

      if (!existingUser) throw new TRPCError({ code: "NOT_FOUND" });

      const isSubscribed = userId
        ? await db.subscription
            .findFirst({
              where: {
                viewerId,
                creatorId: existingUser.id,
              },
            })
            .then(Boolean)
        : false;

      return { ...existingUser, isSubscribed };
    }),
});
