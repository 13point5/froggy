import { Button } from "@/components/ui/button";

type StarterPrompt = {
  title: string;
  prompt: string;
};

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "Habit tracker",
    prompt: "Create a habit tracker app",
  },
  {
    title: "SaaS landing page",
    prompt: "Create a SaaS landing page",
  },
  {
    title: "Personal website",
    prompt: "Create a personal website",
  },
];

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function StarterPrompts({ onPromptClick }: StarterPromptsProps) {
  return (
    <div className="flex gap-4 justify-center mt-6 flex-wrap">
      {STARTER_PROMPTS.map((item) => (
        <Button
          key={item.title}
          variant="outline"
          className="rounded-full bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"
          onClick={() => onPromptClick(item.prompt)}
        >
          {item.title} ↑
        </Button>
      ))}
    </div>
  );
}
