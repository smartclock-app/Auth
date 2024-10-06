import { OAuth2Client } from "google-auth-library";

const isProduction = Bun.env.PRODUCTION === "true";

Bun.serve({
  port: Bun.env.PORT || 3000,
  development: !isProduction,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const redirectUri = isProduction ? `${Bun.env.HOST}/callback` : "http://localhost:3000/callback";
    const scope = "https://www.googleapis.com/auth/calendar.readonly";

    if (pathname === "/schema/v1") {
      const schema = Bun.file(import.meta.dir + "/schemas/v1.json");
      return new Response(await schema.text(), { headers: { "Content-Type": "application/json" } });
    }

    if (pathname === "/google") {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

      return Response.redirect(authUrl, 302);
    }

    if (pathname === "/callback") {
      const code = new URL(request.url).searchParams.get("code");

      const client = new OAuth2Client({
        clientId: Bun.env.GOOGLE_CLIENT_ID || "",
        clientSecret: Bun.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri,
      });

      const tokens = await client.getToken(code!);
      return new Response(JSON.stringify({ tokens: tokens.tokens }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response("Not found", { status: 404 });
    }
  },
});
console.log(`Server running at: ${isProduction ? `${Bun.env.HOST}:${Bun.env.PORT}` : "http://localhost:3000"}`);
