"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat-input";
import { StarterPrompts } from "@/components/starter-prompts";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-neutral-950 text-white">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Image
              src="/icons/froggy.svg"
              alt="froggy"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-wider">Froggy</h1>
        </div>

        <h2 className="text-xl text-neutral-400 mx-auto mt-8">
          Leap from idea to app in seconds.
        </h2>

        <div className="mt-12 flex justify-center w-full px">
          <ChatInput
            onSubmit={(message) => {
              console.log("Submitted:", message);
              // Handle the message submission here
              router.push(`/project/123`);
            }}
          />
        </div>

        <StarterPrompts
          onPromptClick={(prompt) => {
            console.log("Selected prompt:", prompt);
            // Handle the prompt click here
          }}
        />
      </div>
    </div>
  );
}
