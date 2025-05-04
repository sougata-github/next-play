import VideoView from "@/components/videos/views/VideoView";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface props {
  params: Promise<{ videoId: string }>;
}

export default async function Page({ params }: props) {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ videoId });
  void trpc.comments.getMany.prefetch({ videoId });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}
