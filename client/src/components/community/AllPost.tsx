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

export default function Posts() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<{ [postId: string]: number }>({});
  const [likedStatus, setLikedStatus] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data } = await axios.get("http://localhost:8800/api/community-posts");
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;

    async function fetchCommentCounts() {
      const counts: { [postId: string]: number } = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(`http://localhost:8800/api/community-comments/${post.id}/comments`);
            counts[post.id] = res.data.length;
          } catch (error) {
            console.error(`Error fetching comments for post ${post.id}:`, error);
            counts[post.id] = 0;
          }
        })
      );
      setCommentCounts(counts);
    }

    fetchCommentCounts();
  }, [posts]);

  useEffect(() => {
    if (posts.length === 0) return;

    async function fetchLikes() {
      const counts: { [postId: string]: number } = {};
      const status: { [postId: string]: boolean } = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(`http://localhost:8800/api/community-posts/${post.id}/likes`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            counts[post.id] = res.data.length;
            status[post.id] = res.data.some((like: any) => like.userId === user?.id);
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

    fetchLikes();
  }, [posts, token, user]);

  async function handleLike(postId: string) {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/like`,
        { userId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post liked!");
      setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      setLikedStatus((prev) => ({ ...prev, [postId]: true }));
    } catch (error) {
      toast.error("Failed to like post");
      console.error("Error liking post:", error);
    }
  }

  async function handleUnlike(postId: string) {
    try {
      await axios.post(
        `http://localhost:8800/api/community-posts/${postId}/unlike`,
        { userId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post unliked!");
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: Math.max((prev[postId] || 0) - 1, 0),
      }));
      setLikedStatus((prev) => ({ ...prev, [postId]: false }));
    } catch (error) {
      toast.error("Failed to unlike post");
      console.error("Error unliking post:", error);
    }
  }

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-2">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="rounded-md">
          <div className="flex">
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-8 w-8 ${likedStatus[post.id] ? "bg-blue-500" : ""}`}
                onClick={() => (user ? handleLike(post.id) : router.push("/auth/login"))}
                disabled={!!likedStatus[post.id]}
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{likeCounts[post.id] || 0}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => (user ? handleUnlike(post.id) : router.push("/auth/login"))}
                disabled={!likedStatus[post.id]}
              >
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  <Link href={`/communities/${post.communityId}`} className="hover:underline">
                    r/{post.community?.name}
                  </Link>
                  {" • "}
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </CardDescription>
              </CardHeader>
              {post.image && (
                <CardContent>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="max-h-80 w-full object-cover rounded-md"
                  />
                </CardContent>
              )}
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/community/posts/${post.id}`}>
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
