"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({
    text: "Next.js",
  });

  return <div>{data.greeting}</div>;
};
