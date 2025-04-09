import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { videoUpdateSchema } from "@/schemas/index";
import { TRPCError } from "@trpc/server";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
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
