"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  link: z.string().optional().default(""),
  image: z.string().optional().default(""),
  video: z.string().optional().default(""),
  audio: z.string().optional().default(""),
});

export default function CreateCommunityPost() {
  // Get communityId from URL parameters
  const { id: communityId } = useParams();
  const router = useRouter();
  // Retrieve JWT token and user info from auth store
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(formData: any) {
    try {
      // Build the payload.
      // We include communityId, the fields from the form, and the user ID from auth store.
      const payload = {
        communityId,
        title: formData.title,
        content: formData.content,
        link: formData.link,
        image: formData.image,
        video: formData.video,
        audio: formData.audio,
        userId: user?.id, // Pass the authenticated user's id
      };

      const response = await axios.post(
        "http://localhost:8800/api/community-posts",
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Community post created!");
      router.push(`/communities/${communityId}/posts/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to create community post");
      console.error("Error creating community post:", error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Community Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         
            {/* Title */}
            <div>
              <label className="block mb-1 font-semibold">Title</label>
              <Input placeholder="Enter post title" {...register("title")} />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
            {/* Content */}
            <div>
              <label className="block mb-1 font-semibold">Content</label>
              <Textarea placeholder="Enter post content" {...register("content")} />
              {errors.content && <p className="text-red-500">{errors.content.message}</p>}
            </div>
            {/* Link */}
            <div>
              <label className="block mb-1 font-semibold">Link (optional)</label>
              <Input placeholder="https://example.com" {...register("link")} />
            </div>
            {/* Image */}
            <div>
              <label className="block mb-1 font-semibold">Image URL (optional)</label>
              <Input placeholder="https://example.com/image.jpg" {...register("image")} />
            </div>
            {/* Video */}
            <div>
              <label className="block mb-1 font-semibold">Video URL (optional)</label>
              <Input placeholder="https://example.com/video.mp4" {...register("video")} />
            </div>
            {/* Audio */}
            <div>
              <label className="block mb-1 font-semibold">Audio URL (optional)</label>
              <Input placeholder="https://example.com/audio.mp3" {...register("audio")} />
            </div>
            <Button type="submit" className="w-full mt-4">
              Create Post
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
