import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; inviteId: string }> }
) {
  try {
    const { orgId, inviteId } = await params;
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
        { message: "Only organization admins can cancel invitations" },
        { status: 403 }
      );
    }

    // Check if the invitation exists and belongs to this organization
    const invite = await prisma.invite.findFirst({
      where: {
        id: inviteId,
        orgId: orgId,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    // Delete the invitation
    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json(
      { message: "An error occurred while cancelling the invitation" },
      { status: 500 }
    );
  }
}
