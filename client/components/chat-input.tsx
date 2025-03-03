"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Gamepad2, Loader2 } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function ChatInput({
  onSubmit,
  placeholder = "Ask Froggy to create a game that...",
  isLoading = false,
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
          minRows={2}
          maxRows={5}
          className="px-2 pt-1 w-full bg-transparent text-white placeholder:text-neutral-500 focus:outline-none resize-none"
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
              <Gamepad2 className="h-4 w-4" />
              Assets
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            className="rounded-md h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
