import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "./redis";

export const ratelimit = new Ratelimit({
  redis,
  //20 requests within 10 seconds will cause a timeout.
  limiter: Ratelimit.slidingWindow(50, "10s"),
});
