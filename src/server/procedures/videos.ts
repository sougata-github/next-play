import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { thumbnailSchema, videoUpdateSchema } from "@/schemas/index";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";
import { TRPCError } from "@trpc/server";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      const viewerReactions = userId
        ? await db.reaction.findFirst({
            where: {
              userId,
              videoId: input.videoId,
            },
          })
        : null;

      const [likeCount, dislikeCount, existingVideo] = await Promise.all([
        db.reaction.count({
          where: {
            videoId: input.videoId,
            type: "LIKE",
          },
        }),
        db.reaction.count({
          where: {
            videoId: input.videoId,
            type: "DISLIKE",
          },
        }),
        db.video.findUnique({
          where: {
            id: input.videoId,
          },
          include: {
            user: true,
            _count: {
              select: {
                views: true,
              },
            },
            reactions: {
              select: {
                type: true,
              },
            },
          },
        }),
      ]);

      if (!existingVideo) throw new TRPCError({ code: "BAD_REQUEST" });

      const isSubscribed = userId
        ? await db.subscription
            .findFirst({
              where: {
                viewerId: userId,
                creatorId: existingVideo.user.id,
              },
            })
            .then(Boolean)
        : false;

      const subscriberCount = await db.subscription.count({
        where: {
          creatorId: existingVideo.userId,
        },
      });

      return {
        existingVideo,
        viewerReactions,
        likeCount,
        dislikeCount,
        subscriberCount,
        isSubscribed,
      };
    }),
  generateTitle: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const {} = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.videoId },
      });
    }),
  generateDescription: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const {} = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.videoId },
      });
    }),
  generateThumbnail: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        prompt: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const validatedFields = thumbnailSchema.safeParse({
        prompt: input.prompt,
      });

      if (!validatedFields.success)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const {} = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.videoId, prompt: input.prompt },
      });
    }),
  revalidate: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingVideo = await db.video.findUnique({
        where: {
          id: input.videoId,
          userId,
        },
      });

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      console.log("uploadthing cleanup...");

      //uploadthing cleanup
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(existingVideo.thumbnailKey);
      }

      if (existingVideo.previewKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(existingVideo.previewKey);
      }

      console.log("Cleanup successfull.");

      await db.video.update({
        where: {
          id: input.videoId,
          userId,
        },
        data: {
          thumbnailKey: null,
          thumbnailUrl: null,
          previewKey: null,
          previewUrl: null,
        },
      });

      if (!existingVideo.muxUploadId)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const directUpload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );

      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const asset = await mux.video.assets.retrieve(directUpload.asset_id);

      if (!asset) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const playbackId = asset.playback_ids?.[0].id;

      //upload to uploadthing
      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      console.log("Uploading to uploadthing...");

      const utapi = new UTApi();
      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

      console.log("Uploaded to uploadthing.");

      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      const updatedVideo = await db.video.update({
        where: {
          id: existingVideo.id,
          userId,
        },
        data: {
          muxStatus: asset.status,
          muxPlaybackId: asset.playback_ids?.[0].id,
          muxAssetId: asset.id,
          thumbnailKey,
          thumbnailUrl,
          previewKey,
          previewUrl,
          duration,
        },
      });

      console.log("Video revalidated");

      return updatedVideo;
    }),
  restore: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const existingVideo = await db.video.findUnique({
        where: {
          id: input.videoId,
          userId,
        },
      });

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      //file cleanup before restoring thumbnail
      if (existingVideo.thumbnailKey && existingVideo.previewKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db.video.update({
          where: {
            id: input.videoId,
            userId,
          },
          data: {
            thumbnailKey: null,
            thumbnailUrl: null,
          },
        });
      }

      if (!existingVideo.muxPlaybackId)
        throw new TRPCError({ code: "BAD_REQUEST" });

      //uploading mux asset ti uploadthing
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      const utapi = new UTApi();
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      if (!uploadedThumbnail.data)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      const updatedVideo = await db.video.update({
        where: {
          id: input.videoId,
          userId,
        },
        data: {
          thumbnailUrl,
          thumbnailKey,
        },
      });

      return updatedVideo;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const deletedVideo = await db.video.delete({
        where: {
          id: input.videoId,
          userId,
        },
      });

      if (!deletedVideo) throw new TRPCError({ code: "NOT_FOUND" });

      //file cleanup after deletion
      if (deletedVideo.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(deletedVideo.thumbnailKey);
      }

      if (deletedVideo.previewKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(deletedVideo.previewKey);
      }

      return deletedVideo;
    }),
  update: protectedProcedure
    .input(
      z.object({
        data: videoUpdateSchema,
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //backend validation
      const validatedFields = videoUpdateSchema.safeParse(input.data);

      if (!validatedFields.success)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const { id: userId } = ctx.user;

      const updatedVideo = await db.video.update({
        where: {
          id: input.videoId,
          userId,
        },
        data: {
          title: input.data.title,
          description: input.data.description ?? "",
          categoryId: input.data.categoryId,
          visibility: input.data.visibility,
          updatedAt: new Date(),
        },
      });

      if (!updatedVideo) throw new TRPCError({ code: "NOT_FOUND" });

      return updatedVideo;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { id: userId } = ctx.user;

      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          passthrough: userId,
          playback_policy: ["public"],
          input: [
            {
              generated_subtitles: [
                {
                  language_code: "en",
                  name: "English",
                },
              ],
            },
          ],
        },
        cors_origin: "*", //set to url in production
      });

      const video = await db.video.create({
        data: {
          userId,
          title: "Untitled",
          muxStatus: "waiting",
          muxUploadId: upload.id,
        },
      });
      return { video, url: upload.url };
    } catch (error) {
      console.error("Video creation failed:", error);
      throw new Error("Failed to create video");
    }
  }),
});
