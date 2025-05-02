import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

// If a "LIKE" already exists, remove it.

// If a "DISLIKE" exists, update it to "LIKE".

// If no reaction exists, create a new "LIKE".
export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingReaction = await db.reaction.findFirst({
        where: {
          userId,
          videoId: input.videoId,
        },
      });

      if (existingReaction) {
        //if liked -> remove it
        if (existingReaction.type === "LIKE") {
          return await db.reaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          //if disliked -> change to like
          return await db.reaction.update({
            where: { id: existingReaction.id },
            data: { type: "LIKE" },
          });
        }
      }

      //liking for first time
      return await db.reaction.create({
        data: {
          userId,
          videoId: input.videoId,
          type: "LIKE",
        },
      });
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingReaction = await db.reaction.findFirst({
        where: {
          userId,
          videoId: input.videoId,
        },
      });

      if (existingReaction) {
        //if disliked -> remove it
        if (existingReaction.type === "DISLIKE") {
          return await db.reaction.delete({
            where: { id: existingReaction.id },
          });
        } else {
          //if liked -> change to dislike
          return await db.reaction.update({
            where: { id: existingReaction.id },
            data: { type: "DISLIKE" },
          });
        }
      }

      //disliking for first time
      return await db.reaction.create({
        data: {
          userId,
          videoId: input.videoId,
          type: "DISLIKE",
        },
      });
    }),
});
