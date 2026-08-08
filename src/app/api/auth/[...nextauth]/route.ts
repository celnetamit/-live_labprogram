import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyPasskeyAssertion } from "@/lib/passkeyAuth";
import { ssoProviders } from "@/lib/ssoProviders";

export const authOptions = {
  /*
    The adapter persists OAuth identities (Account rows) so a Google or
    Microsoft user is linked to one Panoptical account across sign-ins. Sessions
    stay JWT-backed — required, because credentials and passkey sign-ins never
    touch the adapter.
  */
  adapter: PrismaAdapter(prisma) as never,
  providers: [
    ...ssoProviders(),
    /*
      Biometric sign-in. The browser has already had the device verify the
      user's fingerprint or face locally; what arrives here is a signature over
      our one-time challenge, which `verifyPasskeyAssertion` checks against the
      stored public key.
    */
    CredentialsProvider({
      id: "passkey",
      name: "Passkey",
      credentials: {
        response: { label: "Assertion", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.response) return null;
        return await verifyPasskeyAssertion(credentials.response);
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      /*
        An SSO sign-in goes through the adapter, which can hand back a user
        object without our own columns on it. Fill the gaps from the database so
        every session carries id and role regardless of how it was created.
      */
      if (token?.email && (!token.id || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      
      // If the url contains live-labs.org, allow it to bypass the baseUrl restriction
      // This fixes issues if NEXTAUTH_URL in the environment is still set to an old domain
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("live-labs.org") || urlObj.hostname === "localhost") {
          return url;
        }
      } catch (e) {
        // Invalid URL, fallback
      }
      
      // Default behavior
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
