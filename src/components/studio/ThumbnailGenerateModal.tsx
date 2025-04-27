"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { thumbnailSchema } from "@/schemas";
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
  FormDescription,
} from "../ui/form";
import ResponsiveModal from "../ResponsiveModal";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface Props {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThumbnailGenerateModal = ({ videoId, open, onOpenChange }: Props) => {
  const form = useForm<z.infer<typeof thumbnailSchema>>({
    resolver: zodResolver(thumbnailSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const utils = trpc.useUtils();

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Generating thumbnail", {
        description: "This may take some time...",
      });
      utils.studio.getOne.invalidate();
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Couldn't generate thumbnail.");
    },
  });

  const onSubmit = (values: z.infer<typeof thumbnailSchema>) => {
    const { prompt } = values;
    generateThumbnail.mutate({ videoId, prompt });
  };

  return (
    <ResponsiveModal
      title="Generate Thumbnail"
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
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormDescription>
                  Add &ldquo;16:9 ratio&rdquo; at the end for a better output.
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    className="rezie-none"
                    cols={30}
                    rows={5}
                    placeholder="Describe the thumbnail you want to generate."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={generateThumbnail.isPending}>
              {generateThumbnail.isPending ? (
                <Loader className="animate-spin transition size-4" />
              ) : (
                <span>Generate</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default ThumbnailGenerateModal;
