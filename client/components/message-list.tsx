import { ChatInput } from "@/components/chat-input";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export default function MessageList({
  messages,
  onSendMessage,
}: MessageListProps) {
  return (
    <div className="flex flex-col h-full bg-neutral-950 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500">
            <p>Describe your game idea to get started!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "gap-3"
              }`}
            >
              {message.role === "ai" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 relative">
                    <Image
                      src="/icons/froggy.svg"
                      alt="Froggy"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div
                className={`${
                  message.role === "user" ? "max-w-[80%]" : "flex-1"
                }`}
              >
                {message.role === "ai" && (
                  <div className="font-medium text-sm mb-1">Froggy</div>
                )}
                <div
                  className={`${
                    message.role === "user"
                      ? "text-neutral-200 bg-neutral-900 rounded-lg p-3"
                      : "text-neutral-200 prose prose-invert prose-sm"
                  }`}
                >
                  {message.role === "ai" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="px-4 py-3">
          <ChatInput
            onSubmit={onSendMessage}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
