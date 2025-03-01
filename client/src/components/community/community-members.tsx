"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
// Replace useAuth hook with your auth store
import { useAuthStore } from "../../store/authStore"

interface CommunityMembersProps {
  communityId: string
}

export function CommunityMembers({ communityId }: CommunityMembersProps) {
  const user = useAuthStore((state) => state.user)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`http://localhost:8800/api/community-members/${communityId}`, {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Failed to fetch community members")
        }
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error("Error fetching community members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [communityId])

  // Direct fetch for updating member role
  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      const response = await fetch(`http://localhost:8800/api/community-members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to update member role")
      }
      const updatedMember = await response.json()
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: updatedMember.role } : member
        )
      )
    } catch (error) {
      console.error("Error updating member role:", error)
    }
  }

  // Direct fetch for removing a member
  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`http://localhost:8800/api/community-members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to remove member")
      }
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId))
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  // Determine if the current user is an admin in this community
  const isUserAdmin = user && members.some((member) => member.user?.id === user.id && member.role === "admin")

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No members yet</h3>
          <p className="text-muted-foreground mt-2">Be the first to join this community.</p>
        </div>
      ) : (
        members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt={member.user?.username} />
                <AvatarFallback>{member.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{member.user?.username}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === "admin" ? "default" : "outline"}>{member.role}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {user && isUserAdmin && member.user?.id !== user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdateRole(member.id, member.role === "admin" ? "member" : "admin")
                    }
                  >
                    Make {member.role === "admin" ? "Member" : "Admin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRemoveMember(member.id)}>
                    Remove from Community
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))
      )}
    </div>
  )
}
