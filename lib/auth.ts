
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { Role, ClientType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          clientType: user.clientType || undefined,
          fullName: user.fullName || undefined,
          bio: user.bio || undefined,
          image: user.image || undefined,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clientType = user.clientType;
        token.fullName = user.fullName;
        token.bio = user.bio;
      }
      
      // Refresh user data on update
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.clientType = dbUser.clientType || undefined;
          token.fullName = dbUser.fullName || undefined;
          token.bio = dbUser.bio || undefined;
          token.email = dbUser.email;
          token.name = dbUser.fullName;
          token.picture = dbUser.image || undefined;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
        session.user.clientType = token.clientType as ClientType | undefined;
        session.user.fullName = token.fullName as string | undefined;
        session.user.bio = token.bio as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
