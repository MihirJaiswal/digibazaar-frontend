"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, Reply, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import axios from "axios"
import { useAuthStore } from "@/store/authStore"
import { CommentReplyForm } from "@/components/community/comment-reply-form"
import { useRouter } from "next/navigation";

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  parentId: string | null
  upvotes?: number
  liked?: boolean
  user?: {
    username: string
  }
  replies?: Comment[]
}

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [comments, setComments] = useState<Comment[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [commentTree, setCommentTree] = useState<Comment[]>([])
  const router = useRouter();

  useEffect(() => {
    async function fetchComments() {
      try {
        console.log("Fetching comments:", `${process.env.NEXT_PUBLIC_API_URL}/community-comments/${postId}/comments`)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/community-comments/${postId}/comments`, {
          withCredentials: true,
        })


        // Fetch likes for each comment
        const commentsWithLikes = await Promise.all(
          response.data.map(async (comment: Comment) => {
            const likesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/community-comments/${comment.id}/likes`, {
              withCredentials: true,
            })
            return {
              ...comment,
              upvotes: likesResponse.data.length,
              liked: likesResponse.data.some((like: any) => like.userId === user?.id),
            }
          }),
        )

        setComments(commentsWithLikes)
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    }

    if (postId) {
      fetchComments()
    }
  }, [postId, token, user?.id])

  // Build comment tree whenever flat comments array changes
  useEffect(() => {
    // Create a map for quick lookup of comments by ID
    const commentMap = new Map<string, Comment>()
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Build the tree structure
    const rootComments: Comment[] = []

    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!

      if (comment.parentId === null) {
        // This is a root comment
        rootComments.push(commentWithReplies)
      } else {
        // This is a reply, add it to its parent's replies array
        const parentComment = commentMap.get(comment.parentId)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(commentWithReplies)
          parentComment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
          // If parent doesn't exist (shouldn't happen), add as root
          rootComments.push(commentWithReplies)
        }
      }
    })

    setCommentTree(rootComments)
  }, [comments])

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId)
  }

  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!token || !user || !content.trim()) {
      console.error("🚨 No authentication token, user found, or empty reply.")
      return
    }

    try {
      setReplyingTo(null) // Clear this first to prevent re-renders with stale data

      console.log("📝 Submitting reply with token:", token)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/community-comments`,
        { parentId, content, postId },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Add the new comment to our flat list
      const newComment = {
        ...response.data,
        upvotes: 0,
        liked: false,
        author: { username: user.username || "Anonymous" },
      }

      setComments((prev) => [...prev, newComment])
    } catch (error: any) {
      console.error("❌ Error creating reply:", error.response?.data || error)
    }
  }


  const takeToLogin = () => {
    router.push("/auth/login");
  }

  const handleLike = async (commentId: string) => {
    if (!token) {
      console.error("No authentication token found.")
      return
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/community-comments/${commentId}/like`,
        { userId: user?.id },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, upvotes: (comment.upvotes || 0) + 1, liked: true } : comment,
        ),
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleUnlike = async (commentId: string) => {
    if (!token) {
      console.error("No authentication token found.")
      return
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/community-comments/${commentId}/unlike`,
        { userId: user?.id },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, upvotes: Math.max((comment.upvotes || 0) - 1, 0), liked: false }
            : comment,
        ),
      )
    } catch (error) {
      console.error("Error unliking comment:", error)
    }
  }

  const CommentComponent = React.memo(({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const maxDepth = 8 // Maximum nesting level before we stop indenting
    const actualDepth = Math.min(depth, maxDepth)

    return (
      <div className={`${depth > 0 ? "mt-3" : "mt-4"}`}>
        <Card className={`${depth > 0 ? "border-l-4 border-l-gray-200 dark:border-l-gray-700" : ""}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.jpg" alt={comment.user?.username} />
                <AvatarFallback>{comment.user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.user?.username || "Anonymos"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>

            {replyingTo === comment.id && (
              <CommentReplyForm
                onSubmit={(content) => handleSubmitReply(comment.id, content)}
                onCancel={() => setReplyingTo(null)}
                user={user}
              />
            )}
          </CardContent>
          <CardFooter className="px-4 py-2 flex gap-4 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={user ? () => handleLike(comment.id) : takeToLogin}
              disabled={comment.liked}
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm">{comment.upvotes || 0}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={user ? () => handleUnlike(comment.id) : takeToLogin}
              disabled={!comment.liked}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleReply(comment.id)}>
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-auto flex items-center text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                {comment.replies.length}
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Render replies with increased depth */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={`pl-${actualDepth + 1} ml-6 border-l border-gray-200 dark:border-gray-700`}>
            {comment.replies.map((reply) => (
              <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="space-y-2">
      {commentTree.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
      ) : (
        commentTree.map((comment) => <CommentComponent key={comment.id} comment={comment} />)
      )}
    </div>
  )
}

