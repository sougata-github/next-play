import ResponsiveModal from "@/components/ResponsiveModal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThumbnailUploadModal = ({ videoId, open, onOpenChange }: Props) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    toast.success("Thumbnail changed successfully");
    utils.studio.getOne.invalidate({ id: videoId });
    utils.studio.getMany.invalidate();
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{
          videoId,
        }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};

export default ThumbnailUploadModal;
