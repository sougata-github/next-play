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
        parentId: z.string().uuid().nullish(),
        videoId: z.string().uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { parentId, videoId, content } = input;

      if (parentId) {
        const existingComment = await db.comment.findFirst({
          where: {
            id: parentId,
          },
        });

        //check whether comment to reply exists or not
        if (!existingComment && parentId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        //prevent reply on a reply
        if (existingComment?.parentId && parentId) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }

      const validateFields = commentsSchema.safeParse({ content });

      if (!validateFields.success) throw new TRPCError({ code: "BAD_REQUEST" });

      const comment = await db.comment.create({
        data: {
          userId,
          parentId,
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
        parentId: z.string().uuid().nullish(),
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
    .query(async ({ input, ctx }) => {
      const { parentId, videoId, cursor, limit } = input;

      const { clerkUserId } = ctx;

      let userId: string | undefined = undefined;

      if (clerkUserId) {
        const user = await db.user.findUnique({
          where: {
            clerkId: clerkUserId,
          },
        });

        userId = user?.id;
      }

      const totalComments = await db.comment.count({
        where: {
          videoId,
          parentId: null,
        },
      });

      const data = await db.comment.findMany({
        where: {
          videoId,
          parentId: parentId ? parentId : null,
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
          _count: {
            select: {
              replies: true,
            },
          },
          replies: true,
        },
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      const comments = hasMore ? data.slice(0, -1) : data;

      const commentsWithReactions = await Promise.all(
        comments.map(async (comment) => {
          const [likeCount, dislikeCount, viewerReactions] = await Promise.all([
            db.commentReaction.count({
              where: {
                commentId: comment.id,
                type: "LIKE",
              },
            }),
            db.commentReaction.count({
              where: {
                commentId: comment.id,
                type: "DISLIKE",
              },
            }),
            db.commentReaction.findFirst({
              where: {
                commentId: comment.id,
                userId,
              },
            }),
          ]);

          return { ...comment, likeCount, dislikeCount, viewerReactions };
        })
      );

      const lastComment = comments[comments.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastComment.id,
            updatedAt: lastComment.updatedAt,
          }
        : null;

      return { comments: commentsWithReactions, nextCursor, totalComments };
    }),
});
