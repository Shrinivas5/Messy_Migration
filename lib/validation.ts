export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateUser(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string")
  } else if (data.name.trim().length > 100) {
    errors.push("Name must be less than 100 characters")
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email address")
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required and must be a string")
  } else if (data.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  } else if (data.password.length > 128) {
    errors.push("Password must be less than 128 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUserUpdate(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string")
  } else if (data.name.trim().length > 100) {
    errors.push("Name must be less than 100 characters")
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email address")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateLogin(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email must be a valid email address")
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}
