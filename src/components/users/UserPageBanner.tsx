"use client";

import { UserGetOneOutput } from "@/types";
import { Edit2Icon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useState } from "react";
import BannerUploadModal from "./BannerUploadModal";

interface Props {
  user: UserGetOneOutput;
}

export const UserPageBannerSkeleton = () => {
  return <Skeleton className="w-full max-h-[200px] h-[15vh] md:h-[25vh]" />;
};

const UserPageBanner = ({ user }: Props) => {
  const [openBannerUploadModal, setOpenBannerUploadModal] = useState(false);

  const { userId } = useAuth();

  return (
    <>
      <BannerUploadModal
        userId={user.id}
        open={openBannerUploadModal}
        onOpenChange={setOpenBannerUploadModal}
      />
      <div className="relative group">
        <div
          className={cn(
            "w-full max-h-[200px] h-[15vh] md:h-[25vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl",

            user.bannerUrl
              ? "bg-cover bg-center"
              : "bg-gray-100 dark:bg-muted-foreground/20"
          )}
          style={{
            backgroundImage: user.bannerUrl
              ? `url(${user.bannerUrl})`
              : undefined,
          }}
        >
          {user.clerkId === userId && (
            <Button
              type="button"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/20 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => setOpenBannerUploadModal(true)}
            >
              <Edit2Icon className="size-4 text-white" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPageBanner;
