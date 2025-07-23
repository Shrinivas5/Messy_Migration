import { validateUser, validateLogin } from "@/lib/validation"

describe("Validation", () => {
  describe("validateUser", () => {
    it("should validate correct user data", () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      }

      const result = validateUser(userData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject empty name", () => {
      const userData = {
        name: "",
        email: "john@example.com",
        password: "password123",
      }

      const result = validateUser(userData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Name is required and must be a non-empty string")
    })

    it("should reject invalid email", () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      }

      const result = validateUser(userData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Email must be a valid email address")
    })

    it("should reject short password", () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "123",
      }

      const result = validateUser(userData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Password must be at least 6 characters long")
    })
  })

  describe("validateLogin", () => {
    it("should validate correct login data", () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      }

      const result = validateLogin(loginData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should reject missing email", () => {
      const loginData = {
        password: "password123",
      }

      const result = validateLogin(loginData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Email is required")
    })
  })
})
