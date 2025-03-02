"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
interface PostListProps {
  posts: any[];
}

export function PostList({ posts }: PostListProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // State to hold like counts and liked status keyed by post ID
  const [likeCounts, setLikeCounts] = useState<{ [postId: string]: number }>({});
  const [likedStatus, setLikedStatus] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});


  useEffect(() => {
    async function fetchCommentCounts() {
      const counts: { [postId: string]: number } = {};
  
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(
              `http://localhost:8800/api/community-comments/${post.id}/comments`,
              {
                withCredentials: true,
              }
            );
            counts[post.id] = res.data.length; // Count number of comments
          } catch (error) {
            console.error(`Error fetching comments for post ${post.id}:`, error);
            counts[post.id] = 0;
          }
        })
      );
  
      setCommentCounts(counts);
    }
  
    if (posts.length > 0) {
      fetchCommentCounts();
    }
  }, [posts]);
  


  // Fetch like counts and whether the current user liked each post
  useEffect(() => {
    async function fetchLikes() {
      const counts: { [postId: string]: number } = {};
      const status: { [postId: string]: boolean } = {};

      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(
              `http://localhost:8800/api/community-posts/${post.id}/likes`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const likes = res.data; // expecting an array of like records
            counts[post.id] = likes.length;
            // Check if current user has liked this post
            status[post.id] = likes.some((like: any) => like.userId === user?.id);
          } catch (error) {
            console.error(`Error fetching likes for post ${post.id}:`, error);
            counts[post.id] = 0;
            status[post.id] = false;
          }
        })
      );
      setLikeCounts(counts);
      setLikedStatus(status);
    }
    if (posts.length > 0) {
      fetchLikes();
    }
  }, [posts, token, user]);

  // Handler for like action
  async function handleLike(postId: string) {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/like`,
        { userId: user?.id },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post liked!");
      setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      setLikedStatus((prev) => ({ ...prev, [postId]: true }));
    } catch (error) {
      toast.error("Failed to like post");
      console.error("Error liking post:", error);
    }
  }

  // Handler for unlike action
  async function handleUnlike(postId: string) {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/unlike`,
        { userId: user?.id },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post unliked!");
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: Math.max((prev[postId] || 0) - 1, 0)
      }));
      setLikedStatus((prev) => ({ ...prev, [postId]: false }));
    } catch (error) {
      toast.error("Failed to unlike post");
      console.error("Error unliking post:", error);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-2">
          Be the first to create a post in this community.
        </p>
      </div>
    );
  }

  const takeToLogin = () => {
    router.push("/auth/login");
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <div className="flex">
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
              {/* Upvote button: Blue and disabled if liked */}
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-8 w-8 ${likedStatus[post.id] ? "bg-blue-500" : ""}`}
                onClick={user ? () => handleLike(post.id) : takeToLogin}
                disabled={!!likedStatus[post.id]}
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{likeCounts[post.id] || 0}</span>
              {/* Downvote button: Enabled only if already liked */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={user ? () => handleUnlike(post.id) : takeToLogin}
                disabled={!likedStatus[post.id]}
              >
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <CardHeader>
                <CardDescription>
                  <Link href={`/communities/${post.communityId}`} className="hover:underline">
                    r/{post.community?.name}
                  </Link>
                  {" • "}
                  <span>Posted by u/{post.author?.username}</span>
                  {" • "}
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </CardDescription>
                <CardTitle className="text-lg">
                  <Link href={`/communities/${post.communityId}/posts/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
              {/* 🖼️ Show Image if Available */}
              {post.image && post.image.trim() !== "" && (
                <div className="mb-4">
                  <img
                    src={post.image}  // ✅ Correctly uses `post.image`
                    alt={post.title}
                    className="max-h-80 w-full object-cover rounded-md"
                  />
                </div>
              )}

              {/* 🌐 Show Link Preview if it's a Link Post */}
              {post.link && post.link.trim() !== "" && (
                <div className="mb-4">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {post.link}
                  </a>
                </div>
              )}

              {/* 📝 Show Post Content */}
              <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
            </CardContent>

              <CardFooter className="flex gap-4">
              <Button variant="ghost" size="sm" asChild className="gap-2">
                  <Link href={`/community/communities/${post.communityId}/posts/${post.id}`}>
                    <MessageSquare className="h-4 w-4" />
                    {commentCounts[post.id] || 0} Comments
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
