"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface Seller {
  id: string;
  username: string;
  profilePicture: string;
  level: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  seller: Seller;
  images: string[];
  category: string;
  tags: string[];
  deliveryTime: number;
  isLiked?: boolean; // Track if the gig is liked
}

interface GigCardProps {
  gig: Gig;
  showDescription?: boolean;
}

export function GigCard({ gig, showDescription = false }: GigCardProps) {
  const { token } = useAuthStore();
  const [isLiked, setIsLiked] = useState<boolean>(gig.isLiked ?? false);

  // Fetch likes again on mount (ensuring likes persist after refresh)
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
        setIsLiked(!!likedGig?.isLiked); // Update local state
      } catch (error) {
        console.error("Error fetching liked gigs:", error);
      }
    };

    fetchLikes();
  }, [gig.id, token]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

      // Toggle like state instantly for a better UX
      setIsLiked((prev) => !prev);
      toast.success(!isLiked ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("An error occurred while updating favorites.");
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
      <Link href={`/gigs/gig/${gig.id}`} className="flex-grow flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={gig.images[0] || "/placeholder.svg"}
            alt={gig.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full"
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={gig.seller?.profilePicture || "/placeholder.svg"}
              alt={gig.seller?.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{gig.seller?.username}</p>
              <p className="text-xs text-muted-foreground">{gig.seller?.level}</p>
            </div>
          </div>
          <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary">{gig.title}</h3>
          {showDescription && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {gig.description}
            </p>
          )}
          <div className="flex items-center gap-1 mb-3 mt-auto">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{gig.rating}</span>
            <span className="text-sm text-muted-foreground">({gig.reviews})</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="font-bold text-lg">${gig.price}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
