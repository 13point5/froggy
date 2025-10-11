"use client";

import { PromptForm } from "@/components/prompt-form";
import { useAuth } from "@clerk/nextjs";
import { useAuthDialogStore } from "@/store/auth-dialog-store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/db/queries/projects";
import { saveProjectPrompt } from "@/lib/utils";

const PROMPT_STORAGE_KEY = "froggy-home-prompt";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const { isSignedIn } = useAuth();
  const { openSignIn } = useAuthDialogStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Load prompt from localStorage on mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (promptText: string) => {
      // Get first 5 words for project name
      const words = promptText.trim().split(/\s+/);
      const projectName = words.slice(0, 5).join(" ");

      const { data } = await axios.post<Project>("/api/projects", {
        name: projectName,
      });
      return { project: data, initialPrompt: promptText };
    },
    onSuccess: ({ project, initialPrompt }) => {
      // Clear the home prompt from localStorage
      localStorage.removeItem(PROMPT_STORAGE_KEY);
      // Store the initial prompt for this project
      saveProjectPrompt(project.id, initialPrompt);
      // Invalidate projects query to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Navigate to the new project
      router.push(`/project/${project.id}`);
    },
  });

  const handleChange = (value: string) => {
    setPrompt(value);
    // Persist to localStorage
    localStorage.setItem(PROMPT_STORAGE_KEY, value);
  };

  const handleSubmit = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!prompt.trim()) return;

    createProjectMutation.mutate(prompt);
  };

  return (
    <div className="flex flex-col gap-8 items-center min-h-screen p-8">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        <Image
          src="/froggy-transparent-bg.png"
          alt="Froggy"
          width={100}
          height={100}
        />
        <h1 className="text-4xl font-bold">Froggy</h1>
      </div>

      <div className="w-full max-w-2xl">
        <PromptForm
          value={prompt}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
