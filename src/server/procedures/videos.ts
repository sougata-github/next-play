import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { mux } from "@/lib/mux";
import { db } from "@/db";

export const videosRouter = createTRPCRouter({
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
