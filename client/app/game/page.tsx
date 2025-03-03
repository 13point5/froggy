"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import MessageList from "@/components/message-list";
import {
  RefreshCw,
  Loader2,
  Brain,
  Palette,
  Gamepad2,
  Box,
  Gauge,
  Sparkles,
  MessageSquare,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}

function GameContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameUrl, setGameUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "game">("chat");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      handleSendMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Connect to WebSocket server
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_ENDPOINT!);

    ws.onopen = () => {
      // Send the message once connected
      ws.send(
        JSON.stringify({
          type: "user",
          prompt: content,
        })
      );
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setIsLoading(false);

      if (response.status === "success" && response.url) {
        // Update the game URL
        setGameUrl(response.url);

        // Add AI response message
        const aiMessage: Message = {
          role: "ai",
          content:
            response.response ||
            `I've created a game based on your prompt. You can see it in the preview pane.`,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Handle error case
        const aiMessage: Message = {
          role: "ai",
          content: `Sorry, I encountered an error while creating your game.`,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

      // Close the WebSocket connection
      ws.close();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
      const aiMessage: Message = {
        role: "ai",
        content: `Sorry, I encountered an error while connecting to the game server.`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    };
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-neutral-950 text-white">
      {/* Header Navigation Bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <Image src="/icons/froggy.svg" alt="Froggy" width={30} height={30} />
          <h1 className="text-lg font-medium text-neutral-200">Froggy</h1>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Message List - Left Side */}
        <div
          className={`md:w-[500px] w-full border-r border-neutral-800 h-full flex flex-col ${
            activeTab === "chat" ? "block" : "hidden md:block"
          }`}
        >
          <MessageList
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Game Preview - Right Side */}
        <div
          className={`flex-1 h-full flex flex-col ${
            activeTab === "game" ? "block" : "hidden md:block"
          }`}
        >
          {/* URL Bar */}
          <div className="flex items-center p-3 border-b border-neutral-800">
            <div className="flex-1 bg-neutral-900 rounded-md flex items-center px-3 py-1.5 border border-neutral-800">
              <input
                type="text"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-300"
                placeholder="Game URL will appear here..."
              />
              {gameUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-neutral-400 hover:text-neutral-300"
                  onClick={() => {
                    const iframe = document.getElementById(
                      "gameFrame"
                    ) as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = iframe.src;
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Game Preview */}
          <div className="flex-1 h-full p-0 flex items-center justify-center overflow-hidden bg-neutral-900 relative">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-neutral-400 relative w-full h-full justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="relative w-[280px] overflow-hidden h-32">
                  {/* Top shadow overlay */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-neutral-900 to-transparent z-10" />
                  {/* Bottom shadow overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent z-10" />
                  <div className="animate-marquee">
                    {/* First set of messages */}
                    <div className="messages">
                      <p className="py-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 flex-shrink-0" /> Analyzing
                        your game idea
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 flex-shrink-0" /> Generating
                        game assets
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 flex-shrink-0" /> Creating
                        game mechanics
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Box className="w-4 h-4 flex-shrink-0" /> Setting up
                        game environment
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Gauge className="w-4 h-4 flex-shrink-0" /> Optimizing
                        performance
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0" /> Almost
                        there
                      </p>
                    </div>
                    {/* Duplicate set of messages for seamless loop */}
                    <div className="messages">
                      <p className="py-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 flex-shrink-0" /> Analyzing
                        your game idea
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 flex-shrink-0" /> Generating
                        game assets
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 flex-shrink-0" /> Creating
                        game mechanics
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Box className="w-4 h-4 flex-shrink-0" /> Setting up
                        game environment
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Gauge className="w-4 h-4 flex-shrink-0" /> Optimizing
                        performance
                      </p>
                      <p className="py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0" /> Almost
                        there
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : gameUrl ? (
              <iframe
                id="gameFrame"
                src={gameUrl}
                className="w-full h-full border-none"
                title="Game Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-neutral-400">
                Enter a prompt to create a game
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden flex justify-center items-center gap-2 p-4 border-t border-neutral-800">
        <Button
          size="sm"
          className={`flex items-center gap-2 hover:bg-neutral-800 ${
            activeTab === "chat" ? "bg-neutral-900" : "bg-transparent"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </Button>
        <Button
          size="sm"
          className={`flex items-center gap-2 hover:bg-neutral-800 ${
            activeTab === "game" ? "bg-neutral-900" : "bg-transparent"
          }`}
          onClick={() => setActiveTab("game")}
        >
          <Play className="h-4 w-4" />
          <span>Game</span>
        </Button>
      </div>
    </div>
  );
}
