import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the organization
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId: orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Get all members of the organization
    const members = await prisma.orgMembership.findMany({
      where: { orgId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // Format the response
    const formattedMembers = members.map((membership) => ({
      id: membership.userId,
      name: membership.user.name || "Unknown",
      email: membership.user.email,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching members" },
      { status: 500 }
    );
  }
}
