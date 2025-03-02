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

export default function UserPosts() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<{ [postId: string]: number }>({});
  const [likedStatus, setLikedStatus] = useState<{ [postId: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  useEffect(() => {
    async function fetchUserPosts() {
      if (!user) return;
      try {
        const { data } = await axios.get(`http://localhost:8800/api/community-posts/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPosts(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserPosts();
  }, [user, token]);

  useEffect(() => {
    async function fetchCommentCounts() {
      const counts: { [postId: string]: number } = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(`http://localhost:8800/api/community-comments/${post.id}/comments`, {
              withCredentials: true,
            });
            counts[post.id] = res.data.length;
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

  useEffect(() => {
    async function fetchLikes() {
      const counts: { [postId: string]: number } = {};
      const status: { [postId: string]: boolean } = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await axios.get(`http://localhost:8800/api/community-posts/${post.id}/likes`, {
              withCredentials: true,
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
    if (posts.length > 0) {
      fetchLikes();
    }
  }, [posts, token, user]);

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
        [postId]: Math.max((prev[postId] || 0) - 1, 0),
      }));
      setLikedStatus((prev) => ({ ...prev, [postId]: false }));
    } catch (error) {
      toast.error("Failed to unlike post");
      console.error("Error unliking post:", error);
    }
  }

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading your posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-2">You haven't posted anything yet.</p>
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
                className={`rounded-full h-8 w-8 ${likedStatus[post.id] ? "text-red-600" : ""}`}
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
                <CardDescription>
                  <Link href={`/communities/${post.communityId}`} className="hover:underline">
                    r/{post.community?.name}
                  </Link>
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
