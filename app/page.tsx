"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Edit, Search, Users, UserPlus, LogIn } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" })
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [editUser, setEditUser] = useState<{ id: number; name: string; email: string } | null>(null)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const result: ApiResponse = await response.json()

      if (result.success) {
        setUsers(result.data)
      } else {
        showMessage("error", result.error || "Failed to fetch users")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email || !newUser.password) {
      showMessage("error", "All fields are required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        showMessage("success", "User created successfully")
        setNewUser({ name: "", email: "", password: "" })
        fetchUsers()
      } else {
        showMessage("error", result.error || "Failed to create user")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editUser.name, email: editUser.email }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        showMessage("success", "User updated successfully")
        setEditUser(null)
        fetchUsers()
      } else {
        showMessage("error", result.error || "Failed to update user")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        showMessage("success", "User deleted successfully")
        fetchUsers()
      } else {
        showMessage("error", result.error || "Failed to delete user")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchUsers()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/search?name=${encodeURIComponent(searchQuery)}`)
      const result: ApiResponse = await response.json()

      if (result.success) {
        setUsers(result.data)
      } else {
        showMessage("error", result.error || "Search failed")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      showMessage("error", "Email and password are required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        showMessage("success", `Welcome back! User ID: ${result.data.user_id}`)
        setLoginData({ email: "", password: "" })
      } else {
        showMessage("error", result.error || "Login failed")
      }
    } catch (error) {
      showMessage("error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management System</h1>
        <p className="text-muted-foreground">Refactored and secure user management API</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "error" ? "border-red-500" : "border-green-500"}`}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage existing users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button onClick={fetchUsers} disabled={loading}>
                  {loading ? "Loading..." : "Refresh Users"}
                </Button>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditUser({ id: user.id, name: user.name, email: user.email })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No users found. Click "Refresh Users" to load data.
                  </p>
                )}
              </div>

              {editUser && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Edit User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateUser} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={editUser.name}
                          onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editUser.email}
                          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Updating..." : "Update User"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Users</CardTitle>
              <CardDescription>Find users by name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={fetchUsers}>
                  Clear
                </Button>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </div>
                ))}
                {users.length === 0 && searchQuery && (
                  <p className="text-center text-muted-foreground py-8">No users found matching "{searchQuery}"</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>User Login</CardTitle>
              <CardDescription>Test user authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={login} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
