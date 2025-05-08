import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

// If a "LIKE" already exists, remove it.

// If a "DISLIKE" exists, update it to "LIKE".

// If no reaction exists, create a new "LIKE".
export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingReaction = await db.commentReaction.findFirst({
        where: {
          userId,
          commentId: input.commentId,
        },
      });

      if (existingReaction) {
        //if liked -> remove it
        if (existingReaction.type === "LIKE") {
          return await db.commentReaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          //if disliked -> change to like
          return await db.commentReaction.update({
            where: { id: existingReaction.id },
            data: { type: "LIKE" },
          });
        }
      }

      //liking for first time
      return await db.commentReaction.create({
        data: {
          userId,
          commentId: input.commentId,
          type: "LIKE",
        },
      });
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingReaction = await db.commentReaction.findFirst({
        where: {
          userId,
          commentId: input.commentId,
        },
      });

      if (existingReaction) {
        //if disliked -> remove it
        if (existingReaction.type === "DISLIKE") {
          return await db.commentReaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          //if liked -> change to dislike
          return await db.commentReaction.update({
            where: { id: existingReaction.id },
            data: { type: "DISLIKE" },
          });
        }
      }

      //disliking for first time
      return await db.commentReaction.create({
        data: {
          userId,
          commentId: input.commentId,
          type: "DISLIKE",
        },
      });
    }),
});
