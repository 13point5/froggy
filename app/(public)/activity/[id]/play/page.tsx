"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { PipecatAppBase } from "@pipecat-ai/voice-ui-kit";
import { ControlTray } from "@/components/pipecat/control-tray";

const connectUrl = process.env.NEXT_PUBLIC_DAILY_ROOM_URL;

interface Activity {
  id: string;
  name: string;
  code: string;
  projectId: string;
  isPublished: boolean;
}

export default function ActivityPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: activity,
    isLoading,
    error,
  } = useQuery<Activity>({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/activities/${id}`);
      return data.activity;
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Activity not found</h1>
          <p className="text-muted-foreground">
            The activity you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  // The iframe will load from the route handler which injects the tracking script
  const iframeSrc = `/activity/${id}/play/raw`;

  return (
    <div className="h-screen w-full flex flex-col">
      <PipecatAppBase
        transportType="daily"
        connectParams={
          Boolean(connectUrl)
            ? {
                room_url: connectUrl,
              }
            : undefined
        }
        startBotParams={
          Boolean(connectUrl)
            ? undefined
            : {
                endpoint: "/api/start",
              }
        }
        startBotResponseTransformer={
          connectUrl
            ? undefined
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (response: any) => {
                return {
                  room_url: response.dailyRoom,
                  token: response.dailyToken,
                };
              }
        }
      >
        {({ handleConnect, handleDisconnect }) => (
          <>
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-4 border-b bg-background">
              <h1 className="font-semibold text-lg">{activity.name}</h1>
              <ControlTray
                connect={handleConnect}
                disconnect={handleDisconnect}
              />
            </div>

            {/* Activity Content */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={iframeSrc}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title={activity.name}
              />
            </div>
          </>
        )}
      </PipecatAppBase>
    </div>
  );
}
