import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const callbackURL = url.origin;

    const authResponse = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL,
      },
      asResponse: true,
    });

    const location = authResponse.headers.get("location");
    if (!location) {
      return new Response("Failed to generate Google OAuth URL", { status: 500 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Location", location);

    // Forward Set-Cookie header for state verification
    const setCookie = authResponse.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("Set-Cookie", setCookie);
    }

    return new Response(null, {
      status: 302,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw err;
    }
    console.error("Direct Google auth redirect error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
