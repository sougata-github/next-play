"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import UserPageBanner, { UserPageBannerSkeleton } from "../UserPageBanner";
import UserPageInfo, { UserPageInfoSkeleton } from "../UserPageInfo";
import { Separator } from "@/components/ui/separator";

interface Props {
  userId: string;
}

const UserSectionSkeleton = () => {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />

      <Separator />
    </div>
  );
};

const UserSectionSuspense = ({ userId }: Props) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({
    userId,
  });

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  );
};

const UserSection = ({ userId }: Props) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <UserSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default UserSection;
