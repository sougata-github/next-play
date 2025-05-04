import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { commentsSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { videoId, content } = input;

      const validateFields = commentsSchema.safeParse({ content });

      if (!validateFields.success) throw new TRPCError({ code: "BAD_REQUEST" });

      const comment = await db.comment.create({
        data: {
          userId,
          videoId,
          content,
        },
      });

      return comment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      const comments = await db.comment.findMany({
        where: {
          videoId,
        },
        include: {
          user: true,
        },
      });

      return comments;
    }),
});
