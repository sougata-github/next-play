import { serve } from "@upstash/workflow/nextjs";
import { UTApi } from "uploadthing/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/db";

interface InputType {
  prompt: string;
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId, prompt } = input;

  // job 1 -> get video
  const video = await context.run("get-video", async () => {
    const existingVideo = await db.video.findUnique({
      where: {
        id: videoId,
        userId,
      },
    });

    if (!existingVideo) throw new Error("Video not found");

    return existingVideo;
  });

  // job 2 -> generate thumbnail
  const thumbnail = await context.run("generate-thumbnail", async () => {
    try {
      const result = await generateText({
        model: google("gemini-2.0-flash-exp"),
        providerOptions: {
          google: { responseModalities: ["TEXT", "IMAGE"] },
        },
        prompt: prompt,
      });

      let base64Image = "";

      for (const file of result.files) {
        if (file.mimeType.startsWith("image/")) {
          base64Image = file.base64;
        }
      }

      if (!base64Image.trim()) {
        throw new Error("Generated image is empty or invalid.");
      }

      // Convert base64 to buffer
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Create Blob and File
      const blob = new Blob([buffer], { type: "image/png" });
      const file = new File([blob], "thumbnail.png", { type: "image/png" });

      // upload to uploadthing
      const utapi = new UTApi();
      const uploadedThumbnail = await utapi.uploadFiles(file);

      if (!uploadedThumbnail || !uploadedThumbnail.data) {
        throw new Error("Failed to upload thumbnail to Uploadthing.");
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      return { thumbnailKey, thumbnailUrl };
    } catch (error) {
      console.log(error);
      throw new Error("Error generating or uploading thumbnail.");
    }
  });

  if (!thumbnail || !thumbnail.thumbnailKey || !thumbnail.thumbnailUrl) {
    throw new Error("Failed to generate or upload thumbnail.");
  }

  // job 3 -> uploadthing cleanup
  await context.run("uploadthing-cleanup", async () => {
    if (video.thumbnailKey) {
      const utapi = new UTApi();
      await utapi.deleteFiles(video.thumbnailKey);
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
  });

  // job 4 -> update video
  await context.run("update-video", async () => {
    await db.video.update({
      where: {
        id: videoId,
        userId,
      },
      data: {
        thumbnailKey: thumbnail.thumbnailKey,
        thumbnailUrl: thumbnail.thumbnailUrl,
      },
    });
  });
});
