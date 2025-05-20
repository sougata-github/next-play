"use client";

import { Loader, PlusIcon } from "lucide-react";

import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import ResponsiveModal from "../ResponsiveModal";
import StudioUploader from "./StudioUploader";
import { useRouter } from "next/navigation";

const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created");
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Couldn't create video!");
    },
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
        ) : (
          <Loader className="animate-spin transition-all" />
        )}
      </ResponsiveModal>
      <Button
        onClick={() => create.mutate()}
        disabled={create.isPending}
        className="w-[92px]"
      >
        {create.isPending ? (
          <Loader className="animate-spin transition-all" />
        ) : (
          <>
            <PlusIcon />
            Create
          </>
        )}
      </Button>
    </>
  );
};

export default StudioUploadModal;
