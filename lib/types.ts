import { createActivity } from "@/app/api/chat/tools/create-activity";
import { queryEvents } from "@/app/api/chat/tools/query-events";
import { createAnalytics } from "@/app/api/chat/tools/create-analytics";
import { InferUITool, UIDataTypes, UIMessage } from "ai";
import { z } from "zod";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type createActivityTool = InferUITool<ReturnType<typeof createActivity>>;
type queryEventsTool = InferUITool<ReturnType<typeof queryEvents>>;
type createAnalyticsTool = InferUITool<ReturnType<typeof createAnalytics>>;

export type ChatTools = {
  createActivity: createActivityTool;
  queryEvents: queryEventsTool;
  createAnalytics: createAnalyticsTool;
};

export type ChatMessage = UIMessage<MessageMetadata, UIDataTypes, ChatTools>;

export type Activity = {
  id: string;
  name: string;
  code: string;
  projectId: string;
  isPublished: boolean;
};
