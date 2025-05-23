"use client";

import { THUMBNAIL_FALLBACK } from "@/constants";
import MuxPlayer from "@mux/mux-player-react";
import { Skeleton } from "../ui/skeleton";

interface Props {
  playbackId?: string | undefined;
  thumbnailUrl?: string | null | undefined;
  onPlay?: () => void;
  autoPlay: boolean;
}

export const VideoPlayerSkeleton = () => {
  return <Skeleton className="aspect-video rounded-xl" />;
};

const VideoPlayer = ({ playbackId, thumbnailUrl, onPlay, autoPlay }: Props) => {
  return (
    <MuxPlayer
      autoPlay={autoPlay}
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      thumbnailTime={0}
      onPlay={onPlay}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
    />
  );
};

export default VideoPlayer;
