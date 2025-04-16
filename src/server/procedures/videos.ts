import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { videoUpdateSchema } from "@/schemas/index";
import { UTApi } from "uploadthing/server";
import { TRPCError } from "@trpc/server";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
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
      if (existingVideo.thumbnailKey) {
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
