"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

// Define interfaces for our data types
interface Post {
  id: string;
  title: string;
  communityId: string;
  community?: {
    name: string;
  };
  createdAt: string;
  image?: string;
  content: string;
}

interface Like {
  userId: string;
}

interface Comment {
  // Define properties as needed. For count purposes, an empty interface is sufficient.
}

interface User {
  id: string;
  // Add other properties if required
}

// Define props for the PostCard component
interface PostCardProps {
  post: Post;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  user: User | null;
  router: { push: (url: string) => void };
}

// Memoized PostCard component to avoid unnecessary re-renders
const PostCard: React.FC<PostCardProps> = React.memo(function PostCard({
  post,
  likeCount,
  liked,
  commentCount,
  onLike,
  onUnlike,
  user,
  router,
}) {
  return (
    <Card key={post.id} className="rounded-md">
      <div className="flex">
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-8 w-8 ${liked ? "bg-blue-500" : ""}`}
            onClick={() => (user ? onLike(post.id) : router.push("/auth/login"))}
            disabled={liked}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{likeCount}</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => (user ? onUnlike(post.id) : router.push("/auth/login"))}
            disabled={!liked}
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
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                className="max-h-80 w-full object-cover rounded-md"
                loading="lazy"
              />
            </CardContent>
          )}
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/community/posts/${post.id}`}>
                <MessageSquare className="h-4 w-4" />
                {commentCount} Comments
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
  );
});

export default function Posts() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Fetch posts on mount
  useEffect(() => {
    async function fetchPosts(): Promise<void> {
      try {
        const { data } = await axios.get<Post[]>("http://localhost:8800/api/community-posts");
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Fetch likes and comment counts in parallel once posts are loaded
  useEffect(() => {
    if (posts.length === 0) return;

    async function fetchAdditionalData(): Promise<void> {
      const likeCountsTemp: Record<string, number> = {};
      const likedStatusTemp: Record<string, boolean> = {};
      const commentCountsTemp: Record<string, number> = {};

      await Promise.all(
        posts.map(async (post) => {
          // Fetch comment counts
          try {
            const res = await axios.get<Comment[]>(`http://localhost:8800/api/community-comments/${post.id}/comments`);
            commentCountsTemp[post.id] = res.data.length;
          } catch (error) {
            console.error(`Error fetching comments for post ${post.id}:`, error);
            commentCountsTemp[post.id] = 0;
          }

          // Fetch likes and liked status
          try {
            const res = await axios.get<Like[]>(`http://localhost:8800/api/community-posts/${post.id}/likes`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            likeCountsTemp[post.id] = res.data.length;
            likedStatusTemp[post.id] = res.data.some((like) => like.userId === user?.id);
          } catch (error) {
            console.error(`Error fetching likes for post ${post.id}:`, error);
            likeCountsTemp[post.id] = 0;
            likedStatusTemp[post.id] = false;
          }
        })
      );

      setCommentCounts(commentCountsTemp);
      setLikeCounts(likeCountsTemp);
      setLikedStatus(likedStatusTemp);
    }

    fetchAdditionalData();
  }, [posts, token, user]);

  // Memoized like handler
  const handleLike = useCallback(async (postId: string): Promise<void> => {
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
  }, [token, user]);

  // Memoized unlike handler
  const handleUnlike = useCallback(async (postId: string): Promise<void> => {
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
  }, [token, user]);

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
        <PostCard
          key={post.id}
          post={post}
          likeCount={likeCounts[post.id] || 0}
          liked={likedStatus[post.id] || false}
          commentCount={commentCounts[post.id] || 0}
          onLike={handleLike}
          onUnlike={handleUnlike}
          user={user}
          router={{ push: router.push }}
        />
      ))}
    </div>
  );
}
