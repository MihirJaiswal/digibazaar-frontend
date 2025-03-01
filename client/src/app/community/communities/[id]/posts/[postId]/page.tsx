"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpIcon, ArrowDownIcon, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { CommentList } from "@/components/community/comment-list";
import { CommentForm } from "@/components/community/comment-form";
export default function PostPage() {
  const { id: communityId, postId } = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByUser, setLikedByUser] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching post:", `http://localhost:8800/api/community-posts/${postId}`);
        const postResponse = await axios.get(
          `http://localhost:8800/api/community-posts/${postId}`,
          { withCredentials: true }
        );
        setPost(postResponse.data);

        console.log("Fetching comments:", `http://localhost:8800/api/community-comments/${postId}/comments`);
        const commentsResponse = await axios.get(
          `http://localhost:8800/api/community-comments/${postId}/comments`,
          { withCredentials: true }
        );
        setComments(commentsResponse.data);

        console.log("Fetching likes:", `http://localhost:8800/api/community-posts/${postId}/likes`);
        const likesResponse = await axios.get(
          `http://localhost:8800/api/community-posts/${postId}/likes`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const likes = likesResponse.data;
        setLikeCount(likes.length);
        setLikedByUser(likes.some((like: any) => like.userId === user?.id));
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchData();
    }
  }, [postId, token, user]);
  

  async function handleLike() {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/like`,
        { userId: user?.id },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post liked!");
      setLikeCount((prev) => prev + 1);
      setLikedByUser(true);
    } catch (error) {
      toast.error("Failed to like post");
      console.error("Error liking post:", error);
    }
  }

  async function handleUnlike() {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/unlike`,
        { userId: user?.id },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post unliked!");
      setLikeCount((prev) => Math.max(prev - 1, 0));
      setLikedByUser(false);
    } catch (error) {
      toast.error("Failed to unlike post");
      console.error("Error unliking post:", error);
    }
  }

  const takeToLogin = () => {
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push(`/communities/${communityId}`)}>Back to Community</Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/community/communities/${communityId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to r/{post.community?.name}
        </Link>
      </Button>

      <Card>
        <div className="flex">
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
            {/* Upvote button: Blue and disabled if liked */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-8 w-8 ${likedByUser ? "bg-blue-500" : ""}`}
              onClick={user ? handleLike : takeToLogin}
              disabled={likedByUser}
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{likeCount}</span>
            {/* Downvote button: Enabled only if already liked */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={user ? handleUnlike : takeToLogin}
              disabled={!likedByUser}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <CardHeader>
              <CardDescription>
                <Link href={`/community/communities/${communityId}`} className="hover:underline">
                  r/{post.community?.name}
                </Link>
                {" • "}
                <span>Posted by u/{post.author?.username}</span>
                {" • "}
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </CardDescription>
              <CardTitle className="text-lg">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="prose dark:prose-invert max-w-none">{post.content}</p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {comments.length} Comments
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
      <CommentForm postId={postId as string} />
      <CommentList postId={postId as string} />
    </div>
  );
}
