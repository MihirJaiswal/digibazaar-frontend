"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  CheckCircle,
  MessageSquare,
  Calendar,
  ThumbsUp,
  MapPin,
  Edit,
} from "lucide-react";
import GigReviewForm from "@/components/gigs/GigReviewForm";
import { useAuthStore } from "@/store/authStore";

// Updated Gig interface with the required properties
export interface Gig {
  id: string;
  title: string;
  description: string;
  leadTime: number;
  bulkPrice: number;
  minOrderQty: number;
  totalStars: number;
  starNumber: number;
  sales: number;
  features?: string[];
  category?: string;
  user: {
    id: string;
    username: string;
    profilePic?: string;
    bio?: string;
    country?: string;
    createdAt: string;
    badges?: string[];
  };
  reviews?: Review[];
}

// Assuming a Review type is defined somewhere in your project:
export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface GigTabsProps {
  gig: Gig;
  isOwner: boolean;
}

export default function GigTabs({ gig, isOwner }: GigTabsProps) {
  // Guard to ensure gig is defined before rendering
  if (!gig) {
    return <div>Loading...</div>;
  }

  const [reviews, setReviews] = useState<Review[]>(gig.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuthStore();

  // Format date for the seller's member since information
  const memberSince = new Date(gig.user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Calculate rating
  const rating =
    gig.totalStars > 0 ? (gig.totalStars / gig.starNumber).toFixed(1) : "New";

  const handleReviewSubmit = async (newReview: Review) => {
    setReviews([...reviews, newReview]);
    setShowReviewForm(false);

    // Update gig rating data
    const newTotalStars = gig.totalStars + newReview.rating;
    const newStarNumber = gig.starNumber + 1;

    // Update local gig state
    gig.totalStars = newTotalStars;
    gig.starNumber = newStarNumber;
  };

  // Ensure features is an array
  const features = Array.isArray(gig.features) ? gig.features : [];

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4">
                About This Listing
              </h2>
              {isOwner && (
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Description
                </Button>
              )}
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              {gig.description}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">
                What you&apos;ll get:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.length > 0 ? (
                  features.map(
                    (feature, index) =>
                      feature && (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      )
                  )
                ) : (
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>
                      Product details based on your requirements
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg">
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-blue-500 mb-2" />
                <span className="text-sm text-gray-500">Lead Time</span>
                <span className="font-semibold">
                  {gig.leadTime} day{gig.leadTime !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-purple-500 mb-2" />
                <span className="text-sm text-gray-500">MOQ</span>
                <span className="font-semibold">{gig.minOrderQty} units</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                <Badge className="h-6 w-6 bg-green-500 text-white mb-2" />
                <span className="text-sm text-gray-500">Bulk Price</span>
                <span className="font-semibold">${gig.bulkPrice} per unit</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                <ThumbsUp className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-sm text-gray-500">Completed</span>
                <span className="font-semibold">
                  {gig.sales} order{gig.sales !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="about">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={gig.user.profilePic || "/placeholder.svg?height=64&width=64"}
                  alt={gig.user.username}
                />
                <AvatarFallback className="text-lg">
                  {gig.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{gig.user.username}</h3>
                <p className="text-muted-foreground">
                  {gig.user.bio || "No bio available"}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{gig.user.country || "Not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {gig.user.badges && gig.user.badges.length > 0 ? (
                  gig.user.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      {gig.category?.replace("_", " ") || "General"}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      Supplier
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-3">Response Time</h3>
                <Progress value={85} className="h-2 mb-1" />
                <p className="text-sm text-muted-foreground">
                  Usually responds within 2 hours
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Delivery Rate</h3>
                <Progress value={95} className="h-2 mb-1" />
                <p className="text-sm text-muted-foreground">
                  95% of orders delivered on time
                </p>
              </div>
            </div>

            {!isOwner && (
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Supplier
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews">
        <Card>
          <CardContent className="pt-6">
            <GigReviewForm
              gigId={gig.id}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Frequently Asked Questions
              </h2>
              {isOwner && (
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit FAQ
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  What is the Minimum Order Quantity (MOQ)?
                </h3>
                <p className="text-muted-foreground">
                  The MOQ is the smallest number of units you must order. For
                  this listing, the MOQ is {gig.minOrderQty} units.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  What does Lead Time mean?
                </h3>
                <p className="text-muted-foreground">
                  Lead Time indicates the estimated number of days to prepare
                  and ship your order. For this listing, it is {gig.leadTime} day
                  {gig.leadTime !== 1 ? "s" : ""}.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  How is Bulk Price determined?
                </h3>
                <p className="text-muted-foreground">
                  The Bulk Price is the cost per unit when purchasing in bulk.
                  Please note that the total price depends on the quantity
                  ordered.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
