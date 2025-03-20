"use client";

import { Loader, PlusIcon } from "lucide-react";

import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import ResponsiveModal from "../ResponsiveModal";
import StudioUploader from "./StudioUploader";

const StudioUploadModal = () => {
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

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={() => {}} />
        ) : (
          <Loader className="animate-spin transition-all" />
        )}
      </ResponsiveModal>
      <Button
        variant="secondary"
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
