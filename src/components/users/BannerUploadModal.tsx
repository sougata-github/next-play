import ResponsiveModal from "@/components/ResponsiveModal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BannerUploadModal = ({ userId, open, onOpenChange }: Props) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    toast.success("Banner changed successfully");
    utils.users.getOne.invalidate({ userId });
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload a banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};

export default BannerUploadModal;
