import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await req.json();
    const { name, password } = body;
    
    // Validate input
    if (!name && !password) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: { name?: string; password?: string } = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (password) {
      // Hash password
      const hashedPassword = await hash(password, 12);
      updateData.password = hashedPassword;
    }
    
    // Update user in database
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
