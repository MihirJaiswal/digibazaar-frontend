"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostList } from "@/components/community/post-list"
import { CommunityInfo } from "@/components/community/community-info"
import { CommunityMembers } from "@/components/community/community-members"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "../../../../store/authStore"

export default function CommunityPage() {
  const { id } = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch community info
        const communityResponse = await axios.get(
          `http://localhost:8800/api/communities/${id}`,
          { withCredentials: true }
        )
        setCommunity(communityResponse.data)

        // Fetch posts for this community
        const postsResponse = await axios.get(
          `http://localhost:8800/api/community-posts/community/${id}`,
          { withCredentials: true }
        )
        setPosts(postsResponse.data)
      } catch (error) {
        console.error("Error fetching community data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Community not found</h1>
        <p className="mb-6">
          The community you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/communities")}>
          Browse Communities
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <CommunityInfo community={community} />

      <div className="flex justify-between items-center">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-4 pt-4">
            {user && (
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <Link href={`/community/communities/${id}/submit`}>
                    <Plus className="mr-2 h-4 w-4" /> Create Post
                  </Link>
                </Button>
              </div>
            )}
            <PostList posts={posts} />
          </TabsContent>
          <TabsContent value="about" className="pt-4">
            <div className="prose max-w-none dark:prose-invert">
              <h3>About r/{community.name}</h3>
              <p>{community.description}</p>
              <div className="mt-4">
                <h4>Community Rules</h4>
                <ol className="list-decimal pl-5">
                  <li>Be respectful to others</li>
                  <li>No spam or self-promotion</li>
                  <li>Use appropriate tags for NSFW content</li>
                  <li>No hate speech or harassment</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="members" className="pt-4">
            <CommunityMembers communityId={id as string} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
