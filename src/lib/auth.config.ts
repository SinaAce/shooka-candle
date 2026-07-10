import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = auth?.user?.role === "ADMIN";
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
      const isCheckoutRoute =
        request.nextUrl.pathname.startsWith("/checkout");

      if (isAdminRoute && !isAdmin) {
        return false;
      }

      if ((isAccountRoute || isCheckoutRoute) && !auth) {
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
};
