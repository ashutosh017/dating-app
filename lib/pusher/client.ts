import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

export const isPusherClientConfigured = Boolean(pusherKey);

let clientInstance: PusherClient | null = null;

export function getPusherClient() {
  if (typeof window === "undefined") return null;

  if (!isPusherClientConfigured) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new PusherClient(pusherKey!, {
      cluster: pusherCluster,
    });
  }
  return clientInstance;
}
