import PlaylistView from "@/components/playlists/views/PlaylistView";
import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";

interface Props {
  params: Promise<{ playlistId: string }>;
}

export const dynamic = "force-dynamic";

export default async function PlaylistPage({ params }: Props) {
  const { playlistId } = await params;

  void trpc.playlists.getPlaylistVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
    playlistId,
  });

  void trpc.playlists.getOne.prefetch({
    playlistId,
  });

  return (
    <HydrateClient>
      <PlaylistView playlistId={playlistId} />
    </HydrateClient>
  );
}
