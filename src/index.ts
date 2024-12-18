import { OAuth2Client } from "google-auth-library";

const isProduction = Bun.env.PRODUCTION === "true";

Bun.serve({
  port: Bun.env.PORT || 3000,
  development: !isProduction,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/trakt") {
      const redirectUri = `${Bun.env.HOST}/trakt/callback`;
      const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${Bun.env.TRAKT_CLIENT_ID}&redirect_uri=${redirectUri}`;

      return Response.redirect(authUrl, 302);
    }

    if (pathname === "/trakt/callback") {
      const redirectUri = `${Bun.env.HOST}/trakt/callback`;
      const body = {
        code: new URL(request.url).searchParams.get("code"),
        client_id: Bun.env.TRAKT_CLIENT_ID,
        client_secret: Bun.env.TRAKT_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      };

      const response = await fetch("https://api.trakt.tv/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const tokens = (await response.json()) as any;

      return new Response(JSON.stringify({ tokens }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // prettier-ignore
    if (pathname === "/google") {
      const redirectUri = `${Bun.env.HOST}/google/callback`;
      // Include the scopes you need; SmartClock currently supports Google Calendar
      const scope = ["https://www.googleapis.com/auth/calendar.readonly"];
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${Bun.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope.join(" ")}&access_type=offline`;
      return Response.redirect(authUrl, 302);
    }

    if (pathname === "/google/callback") {
      const redirectUri = `${Bun.env.HOST}/google/callback`;
      const code = new URL(request.url).searchParams.get("code");

      const client = new OAuth2Client({
        clientId: Bun.env.GOOGLE_CLIENT_ID || "",
        clientSecret: Bun.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri,
      });

      const tokens = await client.getToken(code!);

      // @ts-expect-error
      // Convert date from millisecond timestamp to ISO string for easier input into SmartClock config
      tokens.tokens.expiry_date = new Date(tokens.tokens.expiry_date).toISOString();

      return new Response(JSON.stringify({ tokens: tokens.tokens }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // prettier-ignore
    if (pathname === "/google/refresh") {
      const refreshToken = new URL(request.url).searchParams.get("refresh_token");

      const client = new OAuth2Client({
        clientId: Bun.env.GOOGLE_CLIENT_ID || "",
        clientSecret: Bun.env.GOOGLE_CLIENT_SECRET || "",
        credentials: { refresh_token: refreshToken },
      });

      const tokens = await client.refreshAccessToken();

      // @ts-expect-error
      // Convert date from millisecond timestamp to ISO string for easier input into SmartClock config
      tokens.credentials.expiry_date = new Date(tokens.credentials.expiry_date).toISOString();

      return new Response(JSON.stringify({ tokens: tokens.credentials }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } 
    
    // prettier-ignore
    else {
      return new Response("Not found", { status: 404 });
    }
  },
});
console.log(`Server running at: ${isProduction ? `${Bun.env.HOST}:${Bun.env.PORT}` : "http://localhost:3000"}`);
