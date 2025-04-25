import { TITLE_SYSTEM_PROMPT } from "@/constants";
import { serve } from "@upstash/workflow/nextjs";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/db";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId } = input;

  //job 1 -> get video
  const video = await context.run("get-video", async () => {
    const existingVideo = await db.video.findUnique({
      where: {
        id: videoId,
        userId,
      },
    });

    if (!existingVideo) throw new Error("Not found");

    return existingVideo;
  });

  //job 2 -> get transcript
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

    const response = await fetch(trackUrl);

    if (!response.ok)
      throw new Error(response.statusText ?? "Couldn't fetch transcript");

    return response.text();
  });

  //job 3 -> generate title
  const title = await context.run("generate-title", async () => {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: transcript,
      system: TITLE_SYSTEM_PROMPT,
    });

    return text;
  });

  if (!title) throw new Error("Coudln't generate title.");

  //job 4 -> update video title
  await context.run("update-video", async () => {
    await db.video.update({
      where: {
        id: videoId,
        userId,
      },
      data: {
        title: title,
      },
    });
  });
});
