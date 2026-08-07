import { z } from "zod";

export const replySchema = z.object({
  reply: z.string().min(1, { error: "Reply can't be empty." }),
});

export type ReplyValues = z.infer<typeof replySchema>;
