
import { DefaultSession } from "next-auth";
import { Role, ClientType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      clientType?: ClientType;
      fullName?: string;
      bio?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    clientType?: ClientType;
    fullName?: string;
    bio?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    clientType?: ClientType;
    fullName?: string;
    bio?: string;
  }
}
