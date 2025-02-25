"use client"
import { useAuthStore } from "../store/authStore"

export default function DebugAuth() {
  const { user, token } = useAuthStore()
  console.log("User:", user)
  console.log("Token:", token)

  return (
    <div>
      <h1>Check Console for Debugging</h1>
      <p>User: {user ? JSON.stringify(user) : "No User"}</p>
      <p>Token: {token ? token : "No Token"}</p>
    </div>
  )
}