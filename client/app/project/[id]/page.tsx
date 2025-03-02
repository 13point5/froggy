"use client";

import { useState } from "react";
import Link from "next/link";
import MessageList from "@/components/message-list";
import { Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const projectName = `Project ${id}`;

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response (you can replace this with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "ai",
        content: `This is a simulated AI response to: "${content}"`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
      {/* Header Navigation Bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <Home />
          </Link>
        </Button>
        <h1 className="text-xl font-medium">{projectName}</h1>
        <Button variant="ghost" size="icon">
          <Settings />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Message List - Left Side */}
        <div className="w-1/2 p-4 border-r border-neutral-800 h-full">
          <MessageList messages={messages} onSendMessage={handleSendMessage} />
        </div>

        {/* App Preview - Right Side */}
        <div className="w-1/2 p-4 h-full">
          <div className="bg-neutral-900 rounded-lg p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">App Preview</h2>
              <p className="text-neutral-400">
                Your application preview will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
