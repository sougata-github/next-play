import PlaylistVideosSection from "../sections/PlaylistVideosSection";
import PlaylistHeaderSection from "../sections/PlaylistHeaderSection";

interface Props {
  playlistId: string;
}

const PlaylistView = ({ playlistId }: Props) => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistHeaderSection playlistId={playlistId} />
      <PlaylistVideosSection playlistId={playlistId} />
    </div>
  );
};

export default PlaylistView;
