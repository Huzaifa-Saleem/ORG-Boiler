import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: {
          org: true
        }
      }
    }
  });

  return user;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  return session;
}

export async function requireOrganization(orgSlug: string) {
  const session = await requireAuth();
  
  const userOrgs = session.user.organizations || [];
  const hasAccess = userOrgs.some(org => org.slug === orgSlug);
  
  if (!hasAccess) {
    redirect("/dashboard");
  }
  
  return {
    session,
    organization: userOrgs.find(org => org.slug === orgSlug)!
  };
}

export async function createUserWithPassword(email: string, name: string, password: string) {
  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    }
  });
  
  return user;
}

export async function createOrganization(name: string, slug: string, userId: string) {
  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      memberships: {
        create: {
          userId,
          role: "ADMIN"
        }
      }
    }
  });
  
  return organization;
}
