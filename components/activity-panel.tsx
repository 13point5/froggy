"use client";

import { Button } from "@/components/ui/button";
import { X, Globe, Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface ActivityPanelProps {
  name: string;
  code: string;
  isStreaming: boolean;
  projectId: string;
  activityId: string | null;
  onClose: () => void;
}

export function ActivityPanel({
  name,
  code,
  isStreaming,
  projectId,
  activityId,
  onClose,
}: ActivityPanelProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const activityUrl = activityId
    ? `${window.location.origin}/activity/${activityId}/play`
    : null;

  const iframeUrl = activityId ? `/activity/${activityId}/play/raw` : null;

  // Fetch activity status when activityId changes
  useEffect(() => {
    if (activityId) {
      fetchActivityStatus();
    }
  }, [activityId]);

  const fetchActivityStatus = async () => {
    if (!activityId) return;
    try {
      const response = await axios.get(`/api/activities/${activityId}`);
      setIsPublished(response.data.activity.isPublished);
    } catch (error) {
      console.error("Failed to fetch activity status:", error);
    }
  };

  const handlePublish = async () => {
    if (!activityId) return;

    setIsPublishing(true);
    try {
      await axios.patch(`/api/activities/${activityId}`, {
        isPublished: true,
      });
      setIsPublished(true);
    } catch (error) {
      console.error("Failed to publish activity:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!activityId) return;

    setIsUnpublishing(true);
    try {
      await axios.patch(`/api/activities/${activityId}`, {
        isPublished: false,
      });
      setIsPublished(false);
      setPublishDialogOpen(false);
    } catch (error) {
      console.error("Failed to unpublish activity:", error);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCopyUrl = () => {
    if (activityUrl) {
      navigator.clipboard.writeText(activityUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-scroll to bottom when code updates during streaming
  useEffect(() => {
    if (isStreaming && !userScrolled && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [code, isStreaming, userScrolled]);

  // Reset userScrolled when streaming starts
  useEffect(() => {
    if (isStreaming) {
      setUserScrolled(false);
    }
  }, [isStreaming]);

  const handleScroll = () => {
    if (!contentRef.current || !isStreaming) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

    if (!isAtBottom) {
      setUserScrolled(true);
    } else {
      setUserScrolled(false);
    }
  };

  return (
    <>
      <div className="h-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-2 px-3 border-b">
          <h2 className="font-semibold text-lg">{name}</h2>
          <div className="flex items-center gap-2">
            {activityId && !isStreaming && (
              <Button
                variant={isPublished ? "secondary" : "outline"}
                size="sm"
                onClick={() => setPublishDialogOpen(true)}
                disabled={isStreaming || !activityId}
              >
                <Globe className="h-4 w-4" />
                {isPublished ? "Published" : "Publish"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-auto"
          onScroll={handleScroll}
        >
          {isStreaming ? (
            <pre className="text-xs py-2 px-3 whitespace-pre-wrap">{code}</pre>
          ) : activityId ? (
            <iframe
              src={iframeUrl || ""}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title={name}
            />
          ) : (
            <iframe
              srcDoc={code}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title={name}
            />
          )}
        </div>
      </div>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPublished ? "Activity Published" : "Publish Activity"}
            </DialogTitle>
            <DialogDescription>
              {isPublished
                ? "Your activity is currently published"
                : "Make this activity publicly accessible"}
            </DialogDescription>
          </DialogHeader>

          {isPublished ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This activity is published and accessible to anyone with the
                link.
              </p>
              <div className="flex gap-2">
                <Input value={activityUrl || ""} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleUnpublish}
                disabled={isUnpublishing}
              >
                {isUnpublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unpublishing...
                  </>
                ) : (
                  "Unpublish Activity"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Activity"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
