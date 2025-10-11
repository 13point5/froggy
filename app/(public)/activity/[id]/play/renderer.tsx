import { useEffect, useRef } from "react";
import { Activity } from "@/lib/types";
import { usePipecatClient } from "@pipecat-ai/client-react";

interface Props {
  id: string;
  activity: Activity;
}

export const ActivityRenderer = ({ id, activity }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const client = usePipecatClient();

  const iframeSrc = `/activity/${id}/play/raw`;

  const handleSendMetadata = (data: string) => {
    try {
      client?.sendClientMessage("user-metadata", {
        data,
      });
    } catch (error) {
      console.error("Error sending metadata:", error);
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, event: eventName, data, activityId } = event.data;

      if (activityId !== id) return;

      switch (type) {
        case "ACTIVITY_EVENT":
          console.log("Activity event:", eventName, data);
          const metadata = {
            event: eventName,
            data,
          };
          handleSendMetadata(JSON.stringify(metadata, null, 2));
          break;

        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [id]);

  return (
    <div className="flex-1 overflow-hidden">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title={activity.name}
      />
    </div>
  );
};
