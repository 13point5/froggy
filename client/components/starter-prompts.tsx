import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

type StarterPrompt = {
  title: string;
  prompt: string;
};

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "2D Platformer",
    prompt: "Create a 2D platformer game with pixel art style",
  },
  {
    title: "RPG Adventure",
    prompt: "Create an RPG adventure game with turn-based combat",
  },
  {
    title: "Puzzle Game",
    prompt: "Create a puzzle game with increasing difficulty levels",
  },
  {
    title: "Arcade Shooter",
    prompt: "Create a space-themed arcade shooter game",
  },
];

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function StarterPrompts({ onPromptClick }: StarterPromptsProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {STARTER_PROMPTS.map((item) => (
        <Button
          key={item.title}
          variant="outline"
          size="sm"
          className="rounded-full bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200 text-sm px-4 py-2"
          onClick={() => onPromptClick(item.prompt)}
        >
          {item.title}
        </Button>
      ))}
    </div>
  );
}
