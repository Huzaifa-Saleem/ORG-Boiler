import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserWithPassword } from "@/lib/auth-utils";
import { z } from "zod";

// Validation schema for joining with invitation
const joinSchema = z.object({
  token: z.string().uuid("Invalid invitation token"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = joinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { token, name, password } = body;

    // Find the invitation
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { org: true },
    });

    if (!invite) {
      return NextResponse.json(
        { message: "Invalid invitation token" },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    let user;

    // If user exists, check if they're already a member of the organization
    if (existingUser) {
      const existingMembership = await prisma.orgMembership.findUnique({
        where: {
          userId_orgId: {
            userId: existingUser.id,
            orgId: invite.orgId,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { message: "You are already a member of this organization" },
          { status: 400 }
        );
      }

      user = existingUser;
    } else {
      // Create the user if they don't exist
      user = await createUserWithPassword(invite.email, name, password);
    }

    // Add the user to the organization
    const membership = await prisma.orgMembership.create({
      data: {
        userId: user.id,
        orgId: invite.orgId,
        role: invite.role,
      },
    });

    // Delete the invitation
    await prisma.invite.delete({
      where: { id: invite.id },
    });

    return NextResponse.json(
      {
        message: "Successfully joined the organization",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        organization: {
          id: invite.org.id,
          name: invite.org.name,
          slug: invite.org.slug,
        },
        role: invite.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining organization:", error);
    return NextResponse.json(
      { message: "An error occurred while joining the organization" },
      { status: 500 }
    );
  }
}
