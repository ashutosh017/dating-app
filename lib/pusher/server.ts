import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

export const isPusherServerConfigured = Boolean(appId && key && secret);

export const pusherServer = isPusherServerConfigured
  ? new Pusher({
      appId: appId!,
      key: key!,
      secret: secret!,
      cluster,
      useTLS: true,
    })
  : null;

export async function triggerPusherEvent(channel: string, event: string, data: any) {
  if (pusherServer) {
    try {
      await pusherServer.trigger(channel, event, data);
    } catch (err) {
      console.error("[Pusher Server Error]:", err);
    }
  } else {
    // In dev mode without live Pusher credentials, log cleanly
    if (process.env.NODE_ENV === "development") {
      console.log(`[Pusher Dev Dispatch] Channel: ${channel} | Event: ${event}`, data);
    }
  }
}
