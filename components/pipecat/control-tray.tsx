import { usePipecatClient } from "@pipecat-ai/client-react";
import {
  ConnectButton,
  UserAudioControl,
  UserVideoControl,
  UserScreenControl,
  usePipecatConnectionState,
} from "@pipecat-ai/voice-ui-kit";
import { useEffect, useState } from "react";

import "@pipecat-ai/voice-ui-kit/styles.scoped";

interface Props {
  connect?: () => void | Promise<void>;
  disconnect?: () => void | Promise<void>;
}

export const ControlTray = ({ connect, disconnect }: Props) => {
  const client = usePipecatClient();
  const { isDisconnected } = usePipecatConnectionState();

  const [hasDisconnected, setHasDisconnected] = useState(false);

  useEffect(() => {
    if (hasDisconnected) return;
    if (client && isDisconnected) {
      client.initDevices();
    }
  }, [client, hasDisconnected, isDisconnected]);

  const handleConnect = async () => {
    try {
      connect?.();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handleDisconnect = async () => {
    setHasDisconnected(true);
    disconnect?.();
  };

  return (
    <div className="flex items-center gap-2 vkui-root">
      <ConnectButton
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <UserAudioControl visualizerProps={{ barCount: 5 }} />
      <UserVideoControl noVideo />
      <UserScreenControl noScreen />
    </div>
  );
};
