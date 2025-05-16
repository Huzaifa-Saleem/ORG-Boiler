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

    // Get organization by ID
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the organization
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_orgId: {
          userId: currentUser.id,
          orgId: organization.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      userRole: membership.role,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the organization" },
      { status: 500 }
    );
  }
}
