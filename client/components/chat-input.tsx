"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Ask Froggy to create a game that...",
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 px-3 py-2">
        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          minRows={1}
          maxRows={5}
          className="w-full bg-transparent text-white placeholder:text-neutral-500 focus:outline-none resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 rounded-md h-7 px-2"
            >
              <Gamepad2 className="h-3.5 w-3.5 mr-1" />
              Assets
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            className="rounded-md h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
