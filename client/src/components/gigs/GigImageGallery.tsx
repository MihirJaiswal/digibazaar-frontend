"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Pencil, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { Gig } from "@/app/gigs/types/gig";
import Image from "next/image";

interface GigImageGalleryProps {
  gig: Gig;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => Promise<void>;
  onBookmark: () => void;
  isOwner: boolean;
}

export default function GigImageGallery({
  gig,
  isLiked,
  isBookmarked,
  onBookmark,
  isOwner,
}: GigImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(gig.cover);
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();
  const { token } = useAuthStore();

  // Sync local liked state with prop changes
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  // Fetch liked gigs on mount to update like state (ensuring persistent like status)
  useEffect(() => {
    const fetchLikes = async () => {
      if (!token) return; // Skip if user is not authenticated

      try {
        const res = await fetch("http://localhost:8800/api/gig-toggles-likes/gigs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch liked gigs");

        const gigs: Gig[] = await res.json();
        const likedGig = gigs.find((g) => g.id === gig.id);
        setLiked(!!likedGig?.isLiked);
      } catch (error) {
        console.error("Error fetching liked gigs:", error);
      }
    };

    fetchLikes();
  }, [gig.id, token]);

  const handleEditGig = () => {
    router.push(`/gigs/edit/${gig.id}`);
  };

  const handleLike = async () => {
    if (!token) {
      toast.error("Please login to like a gig");
      return;
    }

    try {
      const res = await fetch("http://localhost:8800/api/gig-toggles-likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gigId: gig.id }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }

      // Toggle like state locally for instant feedback
      setLiked((prev) => !prev);
      toast.success(!liked ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("An error occurred while updating favorites.");
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={activeImage || gig.cover || "/placeholder.svg?height=500&width=800"}
            alt={gig.title}
            width={800}
            height={500}
            loading="lazy"
            quality={100}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwner ? (
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={handleEditGig}
              >
                <Pencil className="h-5 w-5 text-gray-700" />
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={onBookmark}
                >
                  <Bookmark
                    className={`h-5 w-5 ${isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`}
                  />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Thumbnails */}
        {gig.images && gig.images.length > 0 && gig.images[0] !== "" && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            <div
              className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                activeImage === gig.cover ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setActiveImage(gig.cover)}
            >
              <Image 
              src={gig.cover || "/placeholder.svg"} 
              alt="thumbnail" 
              width={64}
              height={64}
              loading="lazy"
              quality={100}
              className="h-full w-full object-cover" />
            </div>
            {gig.images.map(
              (img, index) =>
                img && (
                  <div
                    key={index}
                    className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      activeImage === img ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setActiveImage(img)}
                  >
                    <Image 
                    src={img || "/placeholder.svg"} 
                    alt={`thumbnail ${index}`} 
                    width={64}
                    height={64}
                    loading="lazy"
                    quality={100}
                    className="h-full w-full object-cover" />
                  </div>
                )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
