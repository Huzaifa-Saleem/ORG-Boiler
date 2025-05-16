import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-utils";
import { randomUUID } from "crypto";
import { sendInvitationEmail } from "@/lib/email";

// Validation schema for inviting members
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "SUBADMIN", "MEMBER"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin of the organization
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId: orgId,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only organization admins can invite members" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validationResult = inviteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = body;

    // Check if user is already a member
    const existingMember = await prisma.user.findFirst({
      where: {
        email,
        memberships: {
          some: {
            orgId: orgId,
          },
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check if there's already an active invitation
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        orgId: orgId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { message: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Create a unique token for the invitation
    const token = randomUUID();

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation in the database
    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        role,
        expiresAt,
        orgId: orgId,
      },
    });

    // Generate the invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/join?token=${token}`;

    // Send the invitation email using the email utility
    const result = await sendInvitationEmail({
      to: email,
      inviterName: currentUser.name || currentUser.email,
      organizationName: organization.name,
      role: role,
      inviteUrl: inviteUrl,
    });

    if (!result.success || result.error) {
      console.error("Failed to send invitation email:", result.error);

      // Delete the invitation if email sending fails
      await prisma.invite.delete({
        where: { id: invite.id },
      });

      return NextResponse.json(
        { message: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Invitation sent successfully",
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { message: "An error occurred while sending the invitation" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the organization
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId: (await params).orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Get all pending invitations for the organization
    const invitations = await prisma.invite.findMany({
      where: {
        orgId: (await params).orgId,
        expiresAt: {
          gt: new Date(), // Only return non-expired invitations
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedInvitations = invitations.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    }));

    return NextResponse.json(formattedInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching invitations" },
      { status: 500 }
    );
  }
}
