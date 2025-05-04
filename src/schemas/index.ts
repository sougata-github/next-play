import { z } from "zod";

//video schema
const VisibilityEnum = z.enum(["PRIVATE", "PUBLIC"]);

export const videoUpdateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),

  thumbnailUrl: z.string().url().nullable().optional(),
  // previewUrl: z.string().url().nullable().optional(),

  visibility: VisibilityEnum.default("PRIVATE"),
  categoryId: z.string().nullable().optional(),
});

export const thumbnailSchema = z.object({
  prompt: z.string().min(10),
});

export const commentsSchema = z.object({
  content: z.string().min(2),
});
