"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat-input";
import { StarterPrompts } from "@/components/starter-prompts";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-950 text-white">
      <div className="w-full max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative w-[80px] h-[80px]">
            <Image
              src="/icons/froggy.svg"
              alt="froggy"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Froggy</h1>
        </div>

        <h2 className="text-lg text-neutral-400 mx-auto mt-6">
          Leap from idea to playable game in seconds.
        </h2>

        <div className="mt-8 w-full">
          <ChatInput
            onSubmit={(message) => {
              console.log("Submitted:", message);
              router.push(`/project/123`);
            }}
            placeholder="Describe your game idea..."
          />
        </div>

        <div className="mt-4">
          <p className="text-sm text-neutral-500 mb-3">Try one of these examples:</p>
          <StarterPrompts
            onPromptClick={(prompt) => {
              console.log("Selected prompt:", prompt);
              router.push(`/project/123`);
            }}
          />
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-500">
            Froggy helps you create games in seconds using AI.
            <br />
            No coding required.
          </p>
        </div>
      </div>
    </div>
  );
}
