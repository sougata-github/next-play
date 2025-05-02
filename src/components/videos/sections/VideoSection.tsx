"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoPlayer from "../VideoPlayer";
import VideoBanner from "../VideoBanner";
import VideoTopRow from "../VideoTopRow";
import { useAuth } from "@clerk/nextjs";

interface Props {
  videoId: string;
}

const VideoSectionSuspense = ({ videoId }: Props) => {
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();

  const [video] = trpc.videos.getOne.useSuspenseQuery({ videoId });

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate();
    },
    onError: () => {
      console.log("Couldn't create a view");
    },
  });

  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId });
  };

  const existingVideo = video.existingVideo;

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black overflow-hidden relative rounded-xl",
          existingVideo.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={handlePlay}
          playbackId={existingVideo.muxPlaybackId!}
          thumbnailUrl={existingVideo.thumbnailUrl}
        />
      </div>
      <VideoBanner status={existingVideo.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};

const VideoSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default VideoSection;
