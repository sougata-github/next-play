"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/schemas/index";
import { trpc } from "@/trpc/client";
import {
  Check,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader,
  LockIcon,
  MoreVerticalIcon,
  RotateCcw,
  Sparkles,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import VideoPlayer from "@/components/videos/VideoPlayer";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { APP_URL, THUMBNAIL_FALLBACK } from "@/constants";
import ThumbnailUploadModal from "@/components/ThumbnailUploadModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ThumbnailGenerateModal from "../ThumbnailGenerateModal";

interface Props {
  videoId: string;
}

const FormSectionSekeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </div>
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Form content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-y-8 lg:col-span-2 justify-between">
          <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FormSectionSuspense = ({ videoId }: Props) => {
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);

  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });

  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const utils = trpc.useUtils();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success("Video details updated.");
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate();
    },
    onError: () => {
      toast.error("Couldn't update video!");
    },
  });

  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video deleted");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Couldn't delete video");
    },
  });

  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      toast.success("Video revalidated");
      utils.studio.getOne.invalidate();
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Couldn't revalidate video");
    },
  });

  const restoreThumbnail = trpc.videos.restore.useMutation({
    onSuccess: () => {
      toast.success("Thumbnail restored");
      utils.studio.getOne.invalidate();
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Couldn't restore thumbnail.");
    },
  });

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Generating video title", {
        description: "This may take some time...",
      });
      utils.studio.getOne.invalidate();
    },
    onError: () => {
      toast.error("Couldn't generate title.");
    },
  });

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Generating video description", {
        description: "This may take some time...",
      });
      utils.studio.getOne.invalidate();
    },
    onError: () => {
      toast.error("Couldn't generate title.");
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: {
      title: video.title ?? "Untitled",
      description: video.description ?? "",
      categoryId: video.categoryId ?? null,

      visibility: video.visibility ?? "PRIVATE",
    },
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate({ data, videoId });
  };

  const fullUrl = `${APP_URL}/videos/${videoId}`;

  const onCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? (
                  <Loader className="size-4 animate-spin transition" />
                ) : (
                  <span>Save</span>
                )}
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" type="button">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => deleteVideo.mutate({ videoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ videoId })}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Revalidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded-sm [&_svg]:size-3.5 -ml-1 bg-transparent p-1"
                                onClick={() =>
                                  generateTitle.mutate({ videoId })
                                }
                                disabled={generateTitle.isPending}
                              >
                                {generateTitle.isPending ? (
                                  <Loader className="animate-spin transition size-4" />
                                ) : (
                                  <Sparkles />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Generate Title</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Description
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded-sm [&_svg]:size-3.5 -ml-1 bg-transparent p-1"
                                onClick={() =>
                                  generateDescription.mutate({ videoId })
                                }
                                disabled={generateDescription.isPending}
                              >
                                {generateDescription.isPending ? (
                                  <Loader className="animate-spin transition size-4" />
                                ) : (
                                  <Sparkles />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Generate Description
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        {restoreThumbnail.isPending ? (
                          <div className="flex size-full items-center justify-center">
                            <Loader className="animate-spin transition size-4" />
                          </div>
                        ) : (
                          <Image
                            fill
                            alt="Thumbnail"
                            src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                            className="object-cover"
                          />
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-transparent hover:bg-transparent rounded-sm transition absolute top-1 right-1 opacity-100 group-hover:opacity-100 md:opacity-0"
                            >
                              <MoreVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="size-4 mr-1" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnailGenerateModalOpen(true)
                              }
                            >
                              <Sparkles className="size-4 mr-1" />
                              Ai Generated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ videoId })
                              }
                            >
                              <RotateCcw className="size-4 mr-1" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2 lg:justify-between">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div>
                  <VideoPlayer
                    autoPlay={false}
                    playbackId={
                      video.muxPlaybackId ? video.muxPlaybackId : undefined
                    }
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onCopy}
                          disabled={isCopied}
                          className="shrink-0"
                        >
                          {isCopied ? <Check /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitles status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxTrackStatus || "no_audio")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">
                          <div className="flex items-center">
                            <Globe2Icon className="size-4 mr-2" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="PRIVATE">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-2" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

const FormSection = ({ videoId }: Props) => {
  return (
    <Suspense fallback={<FormSectionSekeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default FormSection;
