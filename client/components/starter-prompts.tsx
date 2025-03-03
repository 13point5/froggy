import { Button } from "@/components/ui/button";

type StarterPrompt = {
  title: string;
  prompt: string;
};

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "2D Platformer",
    prompt: "Generate a 2D platformer game inspired by the mechanics of Mario",
  },
  {
    title: "Subway Surfers",
    prompt: "A simple but fully functional game inspired by Subway Surfers",
  },
  {
    title: "Puzzle Game",
    prompt:
      "Can you create a simple puzzle game as a simple but fully functional click game",
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
