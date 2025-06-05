import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { playlistId } = input;

      const playlist = await db.playlist.findUnique({
        where: {
          id: playlistId,
        },
        include: {
          user: true,
        },
      });

      if (!playlist) throw new TRPCError({ code: "NOT_FOUND" });

      return playlist;
    }),
  getPlaylistVideos: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            videoId: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
        playlistId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, playlistId } = input;

      const data = await db.playlistVideo.findMany({
        where: {
          playlistId,
          ...(cursor && {
            OR: [
              {
                updatedAt: {
                  lt: cursor.updatedAt,
                },
              },
              {
                updatedAt: cursor.updatedAt,
                videoId: {
                  lt: cursor.videoId,
                },
              },
            ],
          }),
        },

        orderBy: [{ createdAt: "desc" }, { videoId: "desc" }],
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

      const playlistVideosWithReactions = await Promise.all(
        items.map(async (playlistVideo) => {
          const [likeCount, dislikeCount] = await Promise.all([
            db.reaction.count({
              where: {
                videoId: playlistVideo.videoId,
                type: "LIKE",
              },
            }),
            db.reaction.count({
              where: {
                videoId: playlistVideo.videoId,
                type: "DISLIKE",
              },
            }),
          ]);

          return { ...playlistVideo.video, likeCount, dislikeCount };
        })
      );

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            videoId: lastItem.videoId,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        playlistVideosWithReactions,
        nextCursor,
      };
    }),
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { videoId, playlistId } = input;

      const existingPlaylist = await db.playlist.findUnique({
        where: {
          id: playlistId,
        },
      });

      if (!existingPlaylist) throw new TRPCError({ code: "NOT_FOUND" });

      if (existingPlaylist.userId !== userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      const existingVideo = await db.video.findUnique({
        where: {
          id: videoId,
        },
      });

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const existingPlaylistVideo = await db.playlistVideo.findUnique({
        where: {
          playlistId_videoId: {
            playlistId,
            videoId,
          },
        },
      });

      if (existingPlaylistVideo) throw new TRPCError({ code: "CONFLICT" });

      const createdPlaylistVideo = await db.playlistVideo.create({
        data: {
          playlistId,
          videoId,
        },
      });

      return createdPlaylistVideo;
    }),
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { videoId, playlistId } = input;

      const existingPlaylist = await db.playlist.findUnique({
        where: {
          id: playlistId,
        },
      });

      if (!existingPlaylist) throw new TRPCError({ code: "NOT_FOUND" });

      if (existingPlaylist.userId !== userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      const existingVideo = await db.video.findUnique({
        where: {
          id: videoId,
        },
      });

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const existingPlaylistVideo = await db.playlistVideo.findUnique({
        where: {
          playlistId_videoId: {
            playlistId,
            videoId,
          },
        },
      });

      if (!existingPlaylistVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const deletedPlaylistVideo = await db.playlistVideo.delete({
        where: {
          playlistId_videoId: {
            playlistId,
            videoId,
          },
        },
      });

      return deletedPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit, videoId } = input;

      const data = await db.playlist.findMany({
        where: {
          userId,
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
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
          user: true,
        },
        //sort by latest view
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      const playlistsWithHasVideo = await Promise.all(
        items.map(async (playlist) => {
          const hasVideo = videoId
            ? await db.playlistVideo
                .findUnique({
                  where: {
                    playlistId_videoId: {
                      playlistId: playlist.id,
                      videoId,
                    },
                  },
                })
                .then(Boolean)
            : false;

          return { ...playlist, hasVideo };
        })
      );

      //update cursor
      const lastPlaylist = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastPlaylist.id,
            updatedAt: lastPlaylist.updatedAt,
          }
        : null;

      return {
        playlistsWithHasVideo,
        nextCursor,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(), //not required for first request
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      const data = await db.playlist.findMany({
        where: {
          userId,
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
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
          user: true,
        },

        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      //remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      const playlistsWithThumbnail = await Promise.all(
        items.map(async (playlist) => {
          const playlistVideos = await db.playlistVideo.findMany({
            where: { playlistId: playlist.id },
            include: { video: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          });

          const thumbnailUrl = playlistVideos[0]?.video?.thumbnailUrl ?? null;

          return { ...playlist, thumbnailUrl };
        })
      );

      //update cursor
      const lastPlaylist = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastPlaylist.id,
            updatedAt: lastPlaylist.updatedAt,
          }
        : null;

      return {
        playlistsWithThumbnail,
        nextCursor,
      };
    }),
  remove: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId } = input;

      const existingPlaylist = await db.playlist.findUnique({
        where: {
          id: playlistId,
          userId,
        },
      });

      if (!existingPlaylist) throw new TRPCError({ code: "NOT_FOUND" });

      const deletedPlaylist = await db.playlist.delete({
        where: {
          id: playlistId,
          userId,
        },
      });

      return deletedPlaylist;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const playlist = await db.playlist.create({
        data: {
          userId,
          name: input.name,
        },
      });

      if (!playlist) throw new TRPCError({ code: "BAD_REQUEST" });

      return playlist;
    }),
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
