"use client";

import { useState } from "react";
import Link from "next/link";
import MessageList from "@/components/message-list";
import { Home, Gamepad2, RefreshCw } from "lucide-react";
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
  const [gameUrl, setGameUrl] = useState<string>("https://example.com/game-preview");
  const projectName = `Game Project ${id}`;

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
        content: `I'm working on your game: "${content}". What specific game mechanics would you like to implement?`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
      {/* Header Navigation Bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-neutral-400 hover:text-white">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-base font-medium flex items-center gap-2 text-neutral-200">
            <Gamepad2 className="h-4 w-4 text-green-500" />
            {projectName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Message List - Left Side */}
        <div className="w-[350px] border-r border-neutral-800 h-full flex flex-col">
          <MessageList messages={messages} onSendMessage={handleSendMessage} />
        </div>

        {/* Game Preview - Right Side */}
        <div className="flex-1 h-full flex flex-col">
          {/* URL Bar */}
          <div className="flex items-center p-3 border-b border-neutral-800">
            <div className="flex-1 bg-neutral-900 rounded-md flex items-center px-3 py-1.5 border border-neutral-800">
              <input 
                type="text" 
                value={gameUrl} 
                onChange={(e) => setGameUrl(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-300"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-neutral-400 hover:text-neutral-300"
                onClick={() => {
                  // Refresh iframe
                  const iframe = document.getElementById('gameFrame') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Game Preview */}
          <div className="flex-1 p-0 flex items-center justify-center overflow-auto bg-neutral-900">
            <iframe 
              id="gameFrame"
              src={gameUrl}
              className="w-full h-full border-none"
              title="Game Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
