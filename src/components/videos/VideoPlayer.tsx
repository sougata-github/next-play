"use client";

import { THUMBNAIL_FALLBACK } from "@/constants";
import MuxPlayer from "@mux/mux-player-react";

interface Props {
  playbackId?: string | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

const VideoPlayer = ({ playbackId, thumbnailUrl, autoPlay, onPlay }: Props) => {
  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      onPlay={onPlay}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
    />
  );
};

export default VideoPlayer;
