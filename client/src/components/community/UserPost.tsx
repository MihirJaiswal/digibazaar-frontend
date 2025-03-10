"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define interface for a post
interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image?: string;
  communityId: string;
  community?: { name: string };
}

// ----------------------
// Memoized PostCard Component
// ----------------------
interface PostCardProps {
  post: Post;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  user: any;
  router: ReturnType<typeof useRouter>;
}

const PostCard = memo(function PostCard({
  post,
  likeCount,
  liked,
  commentCount,
  onLike,
  onUnlike,
  user,
  router,
}: PostCardProps) {
  return (
    <Card key={post.id} className="rounded-md">
      <div className="flex">
        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-l-lg">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-8 w-8 ${liked ? "text-red-600" : ""}`}
            onClick={() => (user ? onLike(post.id) : router.push("/auth/login"))}
            disabled={liked}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{likeCount || 0}</span>
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
          <CardFooter className="flex gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href={`/community/communities/${post.communityId}/posts/${post.id}`}>
                <MessageSquare className="h-4 w-4" />
                {commentCount || 0} Comments
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

// ----------------------
// Main UserPosts Component
// ----------------------
export default function UserPosts() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Fetch user posts on mount
  useEffect(() => {
    async function fetchUserPosts() {
      if (!user) return;
      try {
        const { data } = await axios.get<Post[]>(`http://localhost:8800/api/community-posts/user/${user.id}`, {
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

  // Fetch likes and comment counts concurrently for all posts
  useEffect(() => {
    async function fetchExtraData() {
      const likeCountsTemp: Record<string, number> = {};
      const likedStatusTemp: Record<string, boolean> = {};
      const commentCountsTemp: Record<string, number> = {};

      await Promise.all(
        posts.map(async (post) => {
          try {
            // Fetch likes and comments concurrently per post
            const [likesRes, commentsRes] = await Promise.all([
              axios.get(`http://localhost:8800/api/community-posts/${post.id}/likes`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`http://localhost:8800/api/community-comments/${post.id}/comments`, { withCredentials: true }),
            ]);
            likeCountsTemp[post.id] = likesRes.data.length;
            likedStatusTemp[post.id] = likesRes.data.some((like: any) => like.userId === user?.id);
            commentCountsTemp[post.id] = commentsRes.data.length;
          } catch (error) {
            console.error(`Error fetching extra data for post ${post.id}:`, error);
            likeCountsTemp[post.id] = 0;
            likedStatusTemp[post.id] = false;
            commentCountsTemp[post.id] = 0;
          }
        })
      );
      setLikeCounts(likeCountsTemp);
      setLikedStatus(likedStatusTemp);
      setCommentCounts(commentCountsTemp);
    }
    if (posts.length > 0) {
      fetchExtraData();
    }
  }, [posts, token, user]);

  // Memoized like handler
  const handleLike = useCallback(async (postId: string) => {
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
  }, [token, user]);

  // Memoized unlike handler
  const handleUnlike = useCallback(async (postId: string) => {
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
  }, [token, user]);

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading your posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-2">You haven&apos;t posted anything yet.</p>
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
          router={router}
        />
      ))}
    </div>
  );
}
