import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

type OrganizationInfo = {
  id: string;
  name: string;
  slug: string;
  role: Role;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizations: OrganizationInfo[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizations: OrganizationInfo[];
  }
}
