"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { playlistSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "../ui/form";
import ResponsiveModal from "../ResponsiveModal";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePlaylistModal = ({ open, onOpenChange }: Props) => {
  const form = useForm<z.infer<typeof playlistSchema>>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: "",
    },
  });

  const utils = trpc.useUtils();

  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("New Playlist created", {});
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate();
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Couldn't generate thumbnail.");
    },
  });

  const onSubmit = (values: z.infer<typeof playlistSchema>) => {
    create.mutate(values);
  };

  return (
    <ResponsiveModal
      title="Create a Playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Playlist Title</FormLabel>

                <FormControl>
                  <Input {...field} placeholder="Enter title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <Loader className="animate-spin transition size-4" />
              ) : (
                <span>Create</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default CreatePlaylistModal;
