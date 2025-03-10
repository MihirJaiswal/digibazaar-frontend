"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (comment: any) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8800/api/community-comments",
        { postId, content, userId: user?.id },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const comment = response.data;

      setContent("");
      toast.success("Comment added");

      if (onCommentAdded) {
        onCommentAdded(comment);
      }
    } catch {
      toast.error( !user ? "Failed to add comment" : "Please login to add a comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const takeToLogin = () => {
    router.push("/auth/login");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <Textarea
            placeholder="What are your thoughts?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none"
          />
        </CardContent>
        <CardFooter className="flex justify-end px-4 py-3 border-t">
          <Button type="submit" disabled={isSubmitting} onClick={user ? handleSubmit : takeToLogin}>
            {isSubmitting ? "Submitting..." : "Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
