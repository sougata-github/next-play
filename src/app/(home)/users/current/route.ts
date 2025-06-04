import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const existingUser = await db.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!existingUser) return redirect("/sign-in");

  return redirect(`/users/${existingUser.id}`);
};
