import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";

const CredentialsProvider = Credentials?.default || Credentials;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Velour Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@velour.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const cleanEmail = String(credentials.email).toLowerCase().trim();

        // Retrieve user from live MongoDB Atlas database
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        // Safe failure: prevents account enumeration attacks
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        // Verify bcrypt password hash
        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user payload to be encoded in the JWT token (excluding passwordHash)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: persist user attributes to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }

      // Handle client-side session update (e.g. name or image update)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      // Expose safe user identifiers and role to client/server session
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Server-side helper to retrieve authenticated session in Server Components and API Routes
 */
export const getServerAuthSession = () => getServerSession(authOptions);

export default authOptions;
