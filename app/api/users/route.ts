import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { validateUser } from "@/lib/validation"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    const db = DatabaseService.getInstance()
    const users = await db.getAllUsers()

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateUser(body)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(", ") }, { status: 400 })
    }

    const { name, email, password } = body

    // Check if user already exists
    const db = DatabaseService.getInstance()
    const existingUser = await db.getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const userId = await db.createUser(name, email, hashedPassword)

    return NextResponse.json(
      {
        success: true,
        data: { id: userId, message: "User created successfully" },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
