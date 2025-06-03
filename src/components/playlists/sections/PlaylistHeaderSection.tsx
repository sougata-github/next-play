"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { snakeCaseToTitle } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface Props {
  playlistId: string;
}

const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-24" />
    </div>
  );
};

const PlaylistHeaderSectionSuspense = ({ playlistId }: Props) => {
  const { userId } = useAuth();
  const router = useRouter();
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const deletePlaylist = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (error) => {
      toast.error("Failed to delete playlist");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
    playlistId,
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">
          {snakeCaseToTitle(playlist.name)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {playlist.description ?? `Videos from ${playlist.name}`}
        </p>
      </div>
      {playlist.user.clerkId === userId && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => deletePlaylist.mutate({ playlistId })}
        >
          <Trash2Icon />
        </Button>
      )}
    </div>
  );
};

const PlaylistHeaderSection = ({ playlistId }: Props) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistHeaderSection;
