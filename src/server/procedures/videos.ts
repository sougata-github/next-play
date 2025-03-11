import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { id: userId } = ctx.user;

      const video = await db.video.create({
        data: {
          userId,
          title: "Untitled",
        },
      });
      return { video };
    } catch (error) {
      console.error("Video creation failed:", error);
      throw new Error("Failed to create video");
    }
  }),
});
