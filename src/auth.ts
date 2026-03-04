import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";

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

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userResult[0];

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Fetch profile to get role and name
        const profileResult = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
        const profile = profileResult[0];

        return {
          id: user.id,
          email: user.email,
          name: profile?.fullName,
          role: profile?.role || 'customer',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
