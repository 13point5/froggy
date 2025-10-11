import { getActivityById } from "@/lib/db/queries/activities";
import { getProjectById } from "@/lib/db/queries/projects";
import { auth } from "@clerk/nextjs/server";

function injectTrackingScript(html: string, activityId: string): string {
  const script = `<script>
async function trackEvent(event, data = {}) {
  try {
    await fetch('/api/activities/${activityId}/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
</script>`;

  // Try to inject before closing head tag, or before body, or at the start
  if (html.includes("</head>")) {
    return html.replace("</head>", `${script}</head>`);
  } else if (html.includes("<body>")) {
    return html.replace("<body>", `<body>${script}`);
  } else {
    return script + html;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const activity = await getActivityById(id);

    if (!activity) {
      return new Response("Activity not found", { status: 404 });
    }

    // Check access permissions
    let canAccess = false;

    if (activity.isPublished) {
      canAccess = true;
    } else {
      const { userId } = await auth();
      if (userId) {
        const project = await getProjectById(activity.projectId, userId);
        canAccess = !!project;
      }
    }

    if (!canAccess) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Inject tracking function into the activity HTML
    const htmlWithTracking = injectTrackingScript(activity.code, id);

    return new Response(htmlWithTracking, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
