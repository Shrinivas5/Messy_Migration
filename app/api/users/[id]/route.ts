import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { validateUserUpdate } from "@/lib/validation"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    const user = await db.getUserById(userId)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()

    // Validate input
    const validation = validateUserUpdate(body)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(", ") }, { status: 400 })
    }

    const { name, email } = body

    const db = DatabaseService.getInstance()

    // Check if user exists
    const existingUser = await db.getUserById(userId)
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailUser = await db.getUserByEmail(email)
      if (emailUser && emailUser.id !== userId) {
        return NextResponse.json({ success: false, error: "Email already taken by another user" }, { status: 409 })
      }
    }

    // Update user
    await db.updateUser(userId, name, email)

    return NextResponse.json({
      success: true,
      data: { message: "User updated successfully" },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()

    // Check if user exists
    const existingUser = await db.getUserById(userId)
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Delete user
    await db.deleteUser(userId)

    return NextResponse.json({
      success: true,
      data: { message: "User deleted successfully" },
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
  }
}
