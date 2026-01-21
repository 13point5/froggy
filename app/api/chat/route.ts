import { addMessages, getMessagesByProjectId } from "@/lib/db/queries/messages";
import { convertDBMessagesToModelMessages } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
  UIMessage,
} from "ai";
import { createActivity } from "./tools/create-activity";
import { queryEvents } from "./tools/query-events";
import { createAnalytics } from "./tools/create-analytics";
import { getProjectById } from "@/lib/db/queries/projects";
import { auth } from "@clerk/nextjs/server";
import { SYSTEM_PROMPT } from "./prompts";

export const maxDuration = 300;

type RequestBody = {
  message: UIMessage;
  projectId: string;
};

export async function POST(req: Request) {
  const { message, projectId }: RequestBody = await req.json();

  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectById(projectId, userId);
  if (!project) {
    return Response.json(
      { error: "Project not found or unauthorized" },
      { status: 404 }
    );
  }

  const dbMessages = await getMessagesByProjectId(projectId);
  const messages = convertDBMessagesToModelMessages(dbMessages);

  // Add the user message to the database
  await addMessages([
    {
      projectId,
      role: message.role,
      parts: message.parts,
      attachments: [],
    },
  ]);

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: google("gemini-2.5-pro"),
        system: SYSTEM_PROMPT,
        messages: convertToModelMessages([...messages, message]),
        experimental_transform: smoothStream({ chunking: "word" }),
        tools: {
          createActivity: createActivity(projectId),
          queryEvents: queryEvents(projectId),
          createAnalytics: createAnalytics(projectId),
        },
        maxOutputTokens: 64000,
        stopWhen: stepCountIs(20),
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    onFinish: async ({ messages }) => {
      await addMessages(
        messages.map((message) => ({
          projectId,
          role: message.role,
          parts: message.parts,
          attachments: [],
        }))
      );
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}
