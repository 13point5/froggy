"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Ask Froggy to create a web app that...",
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
    <form
      onSubmit={handleSubmit}
      className="w-full md:min-w-[600px] max-w-4xl mx-auto px-6"
    >
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 px-2 py-2">
        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          minRows={2}
          maxRows={5}
          className="pt-2 px-2 w-full bg-transparent text-white placeholder:text-neutral-400 focus:outline-none resize-none min-h-[64px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            className="px-2 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800"
          >
            <ImageIcon className="h-4 w-4" />
            Attach
          </Button>

          <Button
            type="submit"
            size="icon"
            className="rounded-full w-8 h-8 bg-white hover:bg-neutral-200 text-neutral-950"
            onClick={handleSubmit}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
