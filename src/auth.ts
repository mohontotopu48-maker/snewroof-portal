import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import insforge from "@/lib/insforge";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data, error } = await insforge.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data?.user) {
          throw new Error(error?.message || "Invalid credentials");
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: (data.user.profile as any)?.name,
          role: (data.user.profile as any)?.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
