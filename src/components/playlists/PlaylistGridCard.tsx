import { THUMBNAIL_FALLBACK } from "@/constants";
import { PlaylistsGetManyOutput } from "@/types";
import Link from "next/link";

import PlaylistThumbnail, {
  PlaylistThumbnailSkeleton,
} from "./PlaylistThumbnail";
import PlaylistInfo, { PlaylistInfoSkeleton } from "./PlaylistInfo";

interface Props {
  playlist: PlaylistsGetManyOutput["data"][number];
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

const PlaylistGridCard = ({ playlist }: Props) => {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={THUMBNAIL_FALLBACK}
          title={playlist.name}
          videoCount={playlist._count.videos}
        />
        <PlaylistInfo playlist={playlist} />
      </div>
    </Link>
  );
};

export default PlaylistGridCard;
