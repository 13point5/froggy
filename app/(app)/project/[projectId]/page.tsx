"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Chat } from "@/components/chat";
import { ChatMessage } from "@/lib/types";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const { data: initialMessages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["messages", projectId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/projects/${projectId}/messages`);
      return data.messages;
    },
  });

  if (isLoading || !initialMessages) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return <Chat projectId={projectId} initialMessages={initialMessages} />;
}
