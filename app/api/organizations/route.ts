import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  userId: z.string().uuid("Invalid user ID"),
});

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const result = organizationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { name, slug, userId } = body;
    
    // Verify the authenticated user matches the userId in the request
    if (session.user.id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized: User ID mismatch" },
        { status: 403 }
      );
    }
    
    // Check if organization with this slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });
    
    if (existingOrg) {
      return NextResponse.json(
        { message: "Organization with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Create the organization and add the user as an admin
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        message: "Organization created successfully",
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Organization creation error:", error);
    return NextResponse.json(
      { message: "An error occurred during organization creation" },
      { status: 500 }
    );
  }
}
