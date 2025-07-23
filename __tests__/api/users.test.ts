import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/users/route"
import { DatabaseService } from "@/lib/database"
import jest from "jest"

// Mock the database service
jest.mock("@/lib/database")

describe("/api/users", () => {
  let mockDb: jest.Mocked<DatabaseService>

  beforeEach(() => {
    mockDb = {
      getAllUsers: jest.fn(),
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
    } as any
    ;(DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDb)
  })

  describe("GET /api/users", () => {
    it("should return all users successfully", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ]

      mockDb.getAllUsers.mockResolvedValue(mockUsers)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockUsers)
    })

    it("should handle database errors", async () => {
      mockDb.getAllUsers.mockRejectedValue(new Error("Database error"))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe("Failed to fetch users")
    })
  })

  describe("POST /api/users", () => {
    it("should create a user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }

      mockDb.getUserByEmail.mockResolvedValue(null)
      mockDb.createUser.mockResolvedValue(1)

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(1)
    })

    it("should reject invalid input", async () => {
      const invalidData = {
        name: "",
        email: "invalid-email",
        password: "123",
      }

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain("Name is required")
    })

    it("should reject duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
      }

      mockDb.getUserByEmail.mockResolvedValue({
        id: 1,
        name: "Existing User",
        email: "existing@example.com",
      })

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe("User with this email already exists")
    })
  })
})
