import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { validateLogin } from "@/lib/validation"
import { verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateLogin(body)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(", ") }, { status: 400 })
    }

    const { email, password } = body

    const db = DatabaseService.getInstance()
    const user = await db.getUserByEmailWithPassword(email)

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: user.id,
        message: "Login successful",
      },
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
