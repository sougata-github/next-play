import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { UTApi } from "uploadthing/server";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { db } from "@/db";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetDeletedWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set");

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("No signature found", { status: 401 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 });
      }

      // console.log("Creating Video...");

      await db.video.update({
        where: {
          muxUploadId: data.upload_id,
        },
        data: {
          muxAssetId: data.id,
          muxStatus: data.status,
        },
      });

      // console.log("Video Created");
      break;
    }
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];

      const playbackId = data.playback_ids?.[0].id;

      if (!playbackId) {
        return new Response("Missing playback ID", { status: 400 });
      }

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 });
      }

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const existingVideo = await db.video.findUnique({
        where: {
          muxUploadId: data.upload_id,
        },
      });

      if (!existingVideo) {
        return new Response("Cannot find video to update", { status: 500 });
      }

      console.log("Updating video to ready status...");

      //updating mux status
      if (existingVideo.muxStatus !== "ready") {
        await db.video.update({
          where: {
            muxUploadId: data.upload_id,
          },
          data: {
            muxStatus: data.status,
            muxPlaybackId: playbackId,
            muxAssetId: data.id,
            duration,
          },
        });
      }

      //upload to uploadthing when no existing key
      if (!existingVideo.thumbnailKey && !existingVideo.previewKey) {
        const utapi = new UTApi();
        const [uploadedThumbnail, uploadedPreview] =
          await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

        if (!uploadedThumbnail.data || !uploadedPreview.data) {
          return new Response("Failed to upload thumbnail", { status: 500 });
        }

        const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
          uploadedThumbnail.data;

        const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

        //update thumbnail
        await db.video.update({
          where: {
            muxUploadId: data.upload_id,
          },
          data: {
            muxStatus: data.status,
            muxPlaybackId: playbackId,
            muxAssetId: data.id,
            thumbnailUrl,
            thumbnailKey,
            previewUrl,
            previewKey,
            duration,
          },
        });
      }

      console.log("Video ready");

      break;
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 });
      }

      await db.video.update({
        where: {
          muxUploadId: data.upload_id,
        },
        data: {
          muxStatus: data.status,
        },
      });
      break;
    }
    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 });
      }

      console.log("Deleting Video...");

      const deletedVideo = await db.video.delete({
        where: {
          muxUploadId: data.upload_id,
        },
      });

      console.log("Video Deleted");

      //uploadthing cleanup
      console.log("Deleting files from uploadthing...");

      if (deletedVideo.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(deletedVideo.thumbnailKey);
      }

      if (deletedVideo.previewKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(deletedVideo.previewKey);
      }

      console.log("Files deleted from uploadthing.");

      break;
    }
    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;

      if (!assetId) {
        return new Response("Missing asset Id", { status: 400 });
      }

      await db.video.update({
        where: {
          muxAssetId: assetId,
        },
        data: {
          muxTrackId: trackId,
          muxTrackStatus: status,
        },
      });

      console.log("Track ready");
      break;
    }
  }
  return new Response("Webhook received", { status: 200 });
}
