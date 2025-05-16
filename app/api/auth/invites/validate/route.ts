import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { org: true },
    });

    if (!invite) {
      return NextResponse.json(
        { message: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Return invitation details
    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      organization: {
        id: invite.org.id,
        name: invite.org.name,
        slug: invite.org.slug,
      },
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { message: "An error occurred while validating the invitation" },
      { status: 500 }
    );
  }
}
