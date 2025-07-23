import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Name parameter is required" }, { status: 400 })
    }

    const db = DatabaseService.getInstance()
    const users = await db.searchUsersByName(name.trim())

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ success: false, error: "Failed to search users" }, { status: 500 })
  }
}
