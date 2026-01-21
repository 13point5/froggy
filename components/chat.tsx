"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { PromptForm } from "@/components/prompt-form";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { consumeProjectPrompt } from "@/lib/utils";
import { DefaultChatTransport } from "ai";
import { ActivityCard } from "@/components/activity-card";
import { ActivityPanel } from "@/components/activity-panel";
import { AnalyticsCard } from "@/components/analytics-card";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { QueryEventsCard } from "@/components/query-events-card";
import { EmptyChat } from "@/components/empty-chat";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChatMessage } from "@/lib/types";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

interface ChatProps {
  projectId: string;
  initialMessages: ChatMessage[];
}

interface ActivityData {
  messageIndex: number;
  partIndex: number;
  name: string;
  code: string;
  activityId: string | null;
}

interface AnalyticsData {
  messageIndex: number;
  partIndex: number;
  name: string;
  code: string;
}

type PanelType = "activity" | "analytics" | null;

export function Chat({ projectId, initialMessages }: ChatProps) {
  const [input, setInput] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [openAnalyticsId, setOpenAnalyticsId] = useState<string | null>(null);
  const [openPanelType, setOpenPanelType] = useState<PanelType>(null);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest(request) {
        return {
          body: {
            projectId,
            message: request.messages.at(-1),
            ...request.body,
          },
        };
      },
    }),
  });

  console.log("Messages", messages);
  console.log("Status", status);

  // Get activity by ID (messageIndex-partIndex)
  const getActivity = (activityId: string): ActivityData | null => {
    const [messageIndex, partIndex] = activityId.split("-").map(Number);
    const message = messages[messageIndex];
    if (!message) return null;

    const part = message.parts[partIndex];
    if (part?.type !== "tool-createActivity") return null;

    // Extract activityId from output
    const dbActivityId =
      part.output?.success && part.output?.content?.activityId
        ? part.output.content.activityId
        : null;

    return {
      messageIndex,
      partIndex,
      name: part.input?.name || "Untitled Activity",
      code: part.input?.code || "",
      activityId: dbActivityId,
    };
  };

  // Get analytics by ID (messageIndex-partIndex)
  const getAnalytics = (analyticsId: string): AnalyticsData | null => {
    const [messageIndex, partIndex] = analyticsId.split("-").map(Number);
    const message = messages[messageIndex];
    if (!message) return null;

    const part = message.parts[partIndex];
    if (part?.type !== "tool-createAnalytics") return null;

    return {
      messageIndex,
      partIndex,
      name: part.input?.name || "Untitled Analytics",
      code: part.input?.code || "",
    };
  };

  const openActivity = getActivity(openActivityId || "");
  const openAnalytics = getAnalytics(openAnalyticsId || "");

  // Activity is streaming if code field is null or state is not output-available
  const isActivityStreaming = openActivity
    ? (() => {
        const part =
          messages[openActivity.messageIndex]?.parts[openActivity.partIndex];
        if (part?.type !== "tool-createActivity") return false;
        return !part.input?.code || part.state !== "output-available";
      })()
    : false;

  // Analytics is streaming if code field is null or state is not output-available
  const isAnalyticsStreaming = openAnalytics
    ? (() => {
        const part =
          messages[openAnalytics.messageIndex]?.parts[openAnalytics.partIndex];
        if (part?.type !== "tool-createAnalytics") return false;
        return !part.input?.code || part.state !== "output-available";
      })()
    : false;

  // Handle initial prompt from localStorage
  useEffect(() => {
    if (!hasInitialized) {
      const initialPrompt = consumeProjectPrompt(projectId);

      if (initialPrompt) {
        // Send the initial prompt as the first message
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: initialPrompt,
            },
          ],
        });
      }
      setHasInitialized(true);
    }
  }, [projectId, hasInitialized, sendMessage]);

  // Auto-open activity panel when a new activity is being created in the last assistant message
  // useEffect(() => {
  //   if (messages.length === 0) return;

  //   const lastMessage = messages.at(-1);
  //   if (!lastMessage) return;

  //   if (lastMessage.role === "assistant") {
  //     const lastPart = lastMessage.parts.at(-1);
  //     if (!lastPart) return;

  //     if (lastPart.type === "tool-createActivity") {
  //       const activityId = `${messages.length - 1}-${
  //         lastMessage.parts.length - 1
  //       }`;
  //       setOpenActivityId(activityId);
  //     }
  //   }
  // }, [messages]);

  const handleSubmit = (prompt?: string) => {
    const textToSend = prompt || input;
    if (!textToSend.trim()) return;

    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: textToSend,
        },
      ],
    });
    setInput("");
  };

  const hasOpenPanel = openActivity || openAnalytics;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={hasOpenPanel ? 50 : 100} minSize={30}>
        <div className="flex flex-col h-full">
          {messages.length === 0 ? (
            <EmptyChat onPromptClick={handleSubmit} />
          ) : (
            <Conversation className="flex-1">
              <ConversationContent
                className={`${hasOpenPanel ? "" : "max-w-2xl mx-auto "}`}
              >
                {messages.map((message, messageIndex) => {
                  return (
                    <div key={message.id} className="">
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Message
                                key={`${message.id}-${partIndex}`}
                                from={message.role}
                              >
                                <MessageContent variant="flat">
                                  <Response>{part.text}</Response>
                                </MessageContent>
                              </Message>
                            );

                          case "tool-createActivity":
                            const activityId = `${messageIndex}-${partIndex}`;
                            const activityName =
                              part.input?.name || "Creating activity...";
                            const isActivityStreaming =
                              !part.input?.code ||
                              part.state !== "output-available";

                            return (
                              <ActivityCard
                                key={`${message.id}-${partIndex}`}
                                name={activityName}
                                isStreaming={isActivityStreaming}
                                onClick={() => {
                                  setOpenActivityId(activityId);
                                  setOpenAnalyticsId(null);
                                  setOpenPanelType("activity");
                                }}
                              />
                            );

                          case "tool-createAnalytics":
                            const analyticsId = `${messageIndex}-${partIndex}`;
                            const analyticsName =
                              part.input?.name || "Creating analytics...";
                            const isAnalyticsStreamingLocal =
                              !part.input?.code ||
                              part.state !== "output-available";

                            return (
                              <AnalyticsCard
                                key={`${message.id}-${partIndex}`}
                                name={analyticsName}
                                isStreaming={isAnalyticsStreamingLocal}
                                onClick={() => {
                                  setOpenAnalyticsId(analyticsId);
                                  setOpenActivityId(null);
                                  setOpenPanelType("analytics");
                                }}
                              />
                            );

                          case "tool-queryEvents":
                            return (
                              <QueryEventsCard
                                key={`${message.id}-${partIndex}`}
                                activityId={part.input?.activityId}
                                description={part.input?.description}
                                sqlQuery={part.input?.sqlQuery}
                                results={part.output?.content?.results}
                                isStreaming={part.state !== "output-available"}
                                state={part.state}
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  );
                })}
                {status === "submitted" && <Loader />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          <div
            className={`p-4 ${hasOpenPanel ? "" : "max-w-2xl mx-auto w-full"}`}
          >
            <PromptForm
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={status === "streaming" || status === "submitted"}
            />
          </div>
        </div>
      </ResizablePanel>

      {openPanelType === "activity" && openActivity && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <ActivityPanel
              name={openActivity.name}
              code={openActivity.code}
              isStreaming={isActivityStreaming}
              projectId={projectId}
              activityId={openActivity.activityId}
              onClose={() => {
                setOpenActivityId(null);
                setOpenPanelType(null);
              }}
            />
          </ResizablePanel>
        </>
      )}

      {openPanelType === "analytics" && openAnalytics && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <AnalyticsPanel
              name={openAnalytics.name}
              code={openAnalytics.code}
              isStreaming={isAnalyticsStreaming}
              onClose={() => {
                setOpenAnalyticsId(null);
                setOpenPanelType(null);
              }}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
