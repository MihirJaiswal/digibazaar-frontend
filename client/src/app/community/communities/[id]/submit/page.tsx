"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle, FileImage, LinkIcon, Loader2, MessageSquare, Music, Send, Video } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  link: z.string().optional().default(""),
  // We'll handle media (image, video, audio) separately via file inputs.
});

export default function CreateCommunityPost() {
  // Get communityId from URL parameters
  const { id: communityId } = useParams();
  const router = useRouter();
  // Retrieve JWT token and user info from auth store
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage file state and previews for media uploads
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [audioPreview, setAudioPreview] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  // Watch form values for preview of text fields (like title, content, link)
  const watchedValues = watch();

  // Cleanup preview URLs when component unmounts or files change.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [imagePreview, videoPreview, audioPreview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(data: any) {
    try {
      setIsSubmitting(true);
      // Build a FormData payload to support file uploads
      const formData = new FormData();
      formData.append("communityId", communityId as string);
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("link", data.link || "");

      // Append file fields if files have been selected
      if (imageFile) formData.append("image", imageFile);
      if (videoFile) formData.append("video", videoFile);
      if (audioFile) formData.append("audio", audioFile);

      const response = await axios.post(
        "http://localhost:8800/api/community-posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do not manually set Content-Type. Axios will set it with proper boundary.
          },
          withCredentials: true,
        }
      );

      toast.success("Community post created!");
      router.push(`/community/communities/${communityId}/posts/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to create community post");
      console.error("Error creating community post:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Helper function to check if a URL is valid (for link preview)
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // MediaPreview component shows a preview of the uploaded file
  const MediaPreview = ({ type, previewUrl }: { type: string; previewUrl: string }) => {
    if (!previewUrl) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-lg overflow-hidden border bg-card"
      >
        {type === "image" && (
          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
            <Image
              src={previewUrl || "/placeholder.svg?height=200&width=400"}
              alt="Preview"
              width={400}
              height={200}
              loading="lazy"
              quality={100}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=400";
              }}
            />
          </div>
        )}
        {type === "video" && (
          <div className="aspect-video bg-muted">
            <video src={previewUrl} controls className="w-full h-full object-cover" />
          </div>
        )}
        {type === "audio" && (
          <div className="p-4 bg-muted/30">
            <audio src={previewUrl} controls className="w-full" />
          </div>
        )}
        <div className="p-3 text-sm text-muted-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)} preview
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-b from-card to-background">
          <CardHeader className="pb-4 border-b bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-bold">Create a Post</CardTitle>
                <CardDescription>Share something with the community</CardDescription>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.profilePic ? (
                      <Image 
                      src={user.profilePic || "/placeholder.svg"} 
                      alt={user.username} 
                      width={32}
                      height={32}
                      loading="lazy"
                      quality={100}
                      className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">{user.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input id="title" placeholder="Write an interesting title..." className="h-12 text-lg" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title.message}
                    </p>
                  )}
                </div>
                {/* Content Tabs */}
                <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="text" onClick={() => setActiveTab("text")} className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" onClick={() => setActiveTab("media")} className="flex items-center gap-1">
                      <FileImage className="h-4 w-4" />
                      <span className="hidden sm:inline">Media</span>
                    </TabsTrigger>
                    <TabsTrigger value="link" onClick={() => setActiveTab("link")} className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Link</span>
                    </TabsTrigger>
                    <TabsTrigger value="preview" onClick={() => setActiveTab("preview")} className="flex items-center gap-1">
                      <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      <span className="hidden sm:inline">Preview</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-base font-medium">
                        Content <span className="text-destructive">*</span>
                      </Label>
                      <Textarea id="content" placeholder="Share your thoughts with the community..." className="min-h-[200px] resize-y" {...register("content")} />
                      {errors.content && (
                        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.content.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-6 mt-0">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-base font-medium flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        Upload Image
                      </Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                      <MediaPreview type="image" previewUrl={imagePreview} />
                    </div>
                    {/* Video Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="video" className="text-base font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Upload Video
                      </Label>
                      <Input id="video" type="file" accept="video/*" onChange={handleVideoChange} />
                      <MediaPreview type="video" previewUrl={videoPreview} />
                    </div>
                    {/* Audio Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="audio" className="text-base font-medium flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        Upload Audio
                      </Label>
                      <Input id="audio" type="file" accept="audio/*" onChange={handleAudioChange} />
                      <MediaPreview type="audio" previewUrl={audioPreview} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="link" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="link" className="text-base font-medium flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        External Link
                      </Label>
                      <Input id="link" placeholder="https://example.com" {...register("link")} />
                      {watchedValues.link && isValidUrl(watchedValues.link) && (
                        <div className="mt-2 p-3 border rounded-md bg-muted/30 text-sm">
                          <span className="font-medium">Link preview: </span>
                          <a
                            href={watchedValues.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {watchedValues.link}
                          </a>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="space-y-4">
                        {watchedValues.title ? (
                          <h3 className="text-xl font-bold">{watchedValues.title}</h3>
                        ) : (
                          <div className="h-7 bg-muted/50 rounded animate-pulse w-3/4"></div>
                        )}
                        {watchedValues.content ? (
                          <p className="text-muted-foreground whitespace-pre-wrap">{watchedValues.content}</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="h-4 bg-muted/50 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6"></div>
                          </div>
                        )}
                        {watchedValues.link && isValidUrl(watchedValues.link) && (
                          <div className="flex items-center gap-2 text-primary">
                            <LinkIcon className="h-4 w-4" />
                            <a
                              href={watchedValues.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-sm break-all"
                            >
                              {watchedValues.link}
                            </a>
                          </div>
                        )}
                        <MediaPreview type="image" previewUrl={imagePreview} />
                        <MediaPreview type="video" previewUrl={videoPreview} />
                        <MediaPreview type="audio" previewUrl={audioPreview} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Alert variant="default" className="bg-primary/5 border-primary/20">
                        <AlertDescription className="text-sm">
                          This is how your post will appear to the community. Make sure everything looks good before submitting!
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 bg-muted/20 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
