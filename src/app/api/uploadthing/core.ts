import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const user = await db.user.findUnique({
        where: {
          clerkId: clerkUserId,
        },
      });
      if (!user) throw new UploadThingError("Unauthorized");

      //file cleanup
      if (user.bannerKey) {
        const utapi = new UTApi();

        try {
          await utapi.deleteFiles(user.bannerKey);
        } catch (err) {
          console.error("Failed to delete file from UploadThing", err);
        }
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            bannerKey: null,
            bannerUrl: null,
          },
        });
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await db.user.update({
          where: {
            id: metadata.userId,
          },
          data: {
            bannerUrl: file.ufsUrl,
            bannerKey: file.key,
          },
        });
      } catch (err) {
        console.error("Failed to update DB after upload", err);
      }

      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const user = await db.user.findUnique({
        where: {
          clerkId: clerkUserId,
        },
      });
      if (!user) throw new UploadThingError("Unauthorized");

      const existingVideo = await db.video.findUnique({
        where: {
          id: input.videoId,
          userId: user.id,
        },
      });

      if (!existingVideo) throw new UploadThingError("Not found");

      //file cleanup
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        try {
          await utapi.deleteFiles(existingVideo.thumbnailKey);
        } catch (err) {
          console.error("Failed to delete file from UploadThing", err);
        }
        await db.video.update({
          where: {
            id: input.videoId,
            userId: user.id,
          },
          data: {
            thumbnailKey: null,
            thumbnailUrl: null,
          },
        });
      }

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await db.video.update({
          where: {
            id: metadata.videoId,
            userId: metadata.user.id,
          },
          data: {
            thumbnailUrl: file.ufsUrl,
            thumbnailKey: file.key,
          },
        });
      } catch (err) {
        console.error("Failed to update DB after upload", err);
      }

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
