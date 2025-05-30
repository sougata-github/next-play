import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type VideoGetOneOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

export type VideoGetManyOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];

export type CommentsGetManyOutput =
  inferRouterOutputs<AppRouter>["comments"]["getMany"];

export type SearchGetManyOutput =
  inferRouterOutputs<AppRouter>["search"]["getMany"];

export type PlaylistsGetManyOutput =
  inferRouterOutputs<AppRouter>["playlists"]["getMany"];
