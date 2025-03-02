import { ChatInput } from "@/components/chat-input";

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
    <div className="flex flex-col h-full bg-neutral-900 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-white"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-neutral-800">
        <div className="px-0 py-2 mx-2">
          <ChatInput
            onSubmit={onSendMessage}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
