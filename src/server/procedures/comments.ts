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
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { id } = input;

      const deletedComment = await db.comment.delete({
        where: {
          id,
          userId,
        },
      });

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedComment;
    }),
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

      const totalComments = await db.comment.count({
        where: {
          videoId,
        },
      });

      const data = await db.comment.findMany({
        where: {
          videoId,
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
        include: {
          user: true,
        },
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      const comments = hasMore ? data.slice(0, -1) : data;

      const lastComment = comments[comments.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastComment.id,
            updatedAt: lastComment.updatedAt,
          }
        : null;

      return { comments, nextCursor, totalComments };
    }),
});
