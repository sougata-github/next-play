"use client";

import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { VideoGetOneOutput } from "@/types";
import { APP_URL } from "@/constants";
import { useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import PlaylistAddModal from "../playlists/PlaylistAddModal";
import { Button } from "../ui/button";
import { useAuth } from "@clerk/nextjs";

interface Props {
  videoId: VideoGetOneOutput["existingVideo"]["id"];
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

const VideoMenu = ({ videoId, variant = "ghost", onRemove }: Props) => {
  const { isSignedIn } = useAuth();

  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`;

    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      <PlaylistAddModal
        videoId={videoId}
        open={openPlaylistModal}
        onOpenChange={setOpenPlaylistModal}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          {isSignedIn && (
            <DropdownMenuItem onClick={() => setOpenPlaylistModal(true)}>
              <ListPlusIcon className="mr-2 size-4" />
              Add to Playlist
            </DropdownMenuItem>
          )}
          {isSignedIn && onRemove && (
            <DropdownMenuItem onClick={onRemove}>
              <Trash2Icon className="mr-2 size-4" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default VideoMenu;
