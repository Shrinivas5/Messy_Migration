import Database from "better-sqlite3"
import path from "path"

export interface User {
  id: number
  name: string
  email: string
}

export interface UserWithPassword extends User {
  password: string
}

export class DatabaseService {
  private static instance: DatabaseService
  private db: Database.Database

  private constructor() {
    // Initialize database
    const dbPath = path.join(process.cwd(), "users.db")
    this.db = new Database(dbPath)
    this.initializeDatabase()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private initializeDatabase(): void {
    // Create users table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if we need to seed data
    const userCount = this.db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

    if (userCount.count === 0) {
      this.seedDatabase()
    }
  }

  private seedDatabase(): void {
    // Note: In a real application, you'd hash these passwords
    const bcrypt = require("bcryptjs")
    const saltRounds = 10

    const users = [
      { name: "John Doe", email: "john@example.com", password: "password123" },
      { name: "Jane Smith", email: "jane@example.com", password: "secret456" },
      { name: "Bob Johnson", email: "bob@example.com", password: "qwerty789" },
    ]

    const insertUser = this.db.prepare(`
      INSERT INTO users (name, email, password) VALUES (?, ?, ?)
    `)

    users.forEach((user) => {
      const hashedPassword = bcrypt.hashSync(user.password, saltRounds)
      insertUser.run(user.name, user.email, hashedPassword)
    })

    console.log("Database seeded with sample users")
  }

  public async getAllUsers(): Promise<User[]> {
    const stmt = this.db.prepare("SELECT id, name, email FROM users ORDER BY id")
    return stmt.all() as User[]
  }

  public async getUserById(id: number): Promise<User | null> {
    const stmt = this.db.prepare("SELECT id, name, email FROM users WHERE id = ?")
    return stmt.get(id) as User | null
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare("SELECT id, name, email FROM users WHERE email = ?")
    return stmt.get(email) as User | null
  }

  public async getUserByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const stmt = this.db.prepare("SELECT id, name, email, password FROM users WHERE email = ?")
    return stmt.get(email) as UserWithPassword | null
  }

  public async createUser(name: string, email: string, hashedPassword: string): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO users (name, email, password) VALUES (?, ?, ?)
    `)
    const result = stmt.run(name, email, hashedPassword)
    return result.lastInsertRowid as number
  }

  public async updateUser(id: number, name: string, email: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `)
    stmt.run(name, email, id)
  }

  public async deleteUser(id: number): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM users WHERE id = ?")
    stmt.run(id)
  }

  public async searchUsersByName(name: string): Promise<User[]> {
    const stmt = this.db.prepare(`
      SELECT id, name, email FROM users 
      WHERE name LIKE ? 
      ORDER BY name
    `)
    return stmt.all(`%${name}%`) as User[]
  }

  public close(): void {
    this.db.close()
  }
}
