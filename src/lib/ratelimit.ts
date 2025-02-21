import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "./redis";

export const ratelimit = new Ratelimit({
  redis,
  //10 requests withing 10 seconds will cause a timeout.
  limiter: Ratelimit.slidingWindow(20, "10s"),
});
