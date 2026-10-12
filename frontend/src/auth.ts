import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google sign-in via Auth.js. Reads AUTH_SECRET, AUTH_GOOGLE_ID, and
 * AUTH_GOOGLE_SECRET from the environment. Sessions are stateless JWT cookies,
 * so no database is required.
 *
 * If AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are missing, auth is open for local
 * smoke tests (no sign-in wall). Production on Render must set both.
 */
const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: googleConfigured ? [Google] : [],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      if (!googleConfigured) return true;
      if (session?.user) return true;
      const path = request.nextUrl.pathname;
      // The form is public. Sign-in is required when they generate a plan.
      if (
        path === "/" ||
        path.startsWith("/sign-in") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/geocode")
      ) {
        return true;
      }
      if (path.startsWith("/api/")) {
        return Response.json(
          { error: "Unauthorized", details: "Please sign in first." },
          { status: 401 },
        );
      }
      return false;
    },
  },
});
