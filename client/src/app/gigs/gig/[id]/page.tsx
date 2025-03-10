"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import GigHeader from "@/components/gigs/GigHeader";
import GigImageGallery from "@/components/gigs/GigImageGallery";
import GigTabs from "@/components/gigs/GigTabs";
import GigSidebar from "@/components/gigs/GigSidebar";
import { useAuthStore } from "@/store/authStore";
import type { Gig } from "@/app/gigs/types/gig";
import LoadingSkeleton from "@/components/gigs/LoadingSkeleton";

// The inner component that uses React Query hooks
function GigDetailsPageContent() {
  const params = useParams();
  const gigId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch gig details with proper generic types.
  const {
    data: gig,
    isLoading,
    error,
  } = useQuery<Gig, Error>({
    queryKey: ["gig", gigId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8800/api/gigs/${gigId}`);
      if (!response.ok) throw new Error("Gig not found");
      return response.json();
    },
  });

  // Redirect to 404 if there's an error
  useEffect(() => {
    if (error) {
      router.push("/404");
    }
  }, [error, router]);

  // Check if the current user is the owner
  const isOwner = Boolean(user && gig && gig.userId === user.id);

  // Query the like status (only if user exists, gig is loaded, and not the owner)
  const { data: likeStatus } = useQuery({
    queryKey: ["gigLikeStatus", gigId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8800/api/gig-likes/${gigId}`
      );
      if (!response.ok) throw new Error("Error checking like status");
      return response.json();
    },
    enabled: !!user && !!gig && !isOwner,
  });

  // Query the bookmark status (only if user exists, gig is loaded, and not the owner)
  const { data: bookmarkStatus } = useQuery({
    queryKey: ["gigBookmarkStatus", gigId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8800/api/gig-bookmarks/${gigId}`
      );
      if (!response.ok) throw new Error("Error checking bookmark status");
      return response.json();
    },
    enabled: !!user && !!gig && !isOwner,
  });

  // Local state to hold the like and bookmark statuses
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (likeStatus) {
      setIsLiked(likeStatus.isLiked || false);
    }
  }, [likeStatus]);

  useEffect(() => {
    if (bookmarkStatus) {
      setIsBookmarked(bookmarkStatus.isBookmarked || false);
    }
  }, [bookmarkStatus]);

  // Mutation for liking a gig
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:8800/api/gig-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error liking gig");
      return response.json();
    },
    onSuccess: () => {
      setIsLiked((prev) => !prev);
      // Update the gig's like count in the query cache if needed
      queryClient.setQueryData<Gig | undefined>(["gig", gigId], (oldData) => {
        if (!oldData) return oldData;
        const newLikes = isLiked
          ? (oldData.likes || 1) - 1
          : (oldData.likes || 0) + 1;
        return { ...oldData, likes: newLikes };
      });
    },
  });

  // Mutation for bookmarking a gig
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:8800/api/gig-bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error bookmarking gig");
      return response.json();
    },
    onSuccess: () => {
      setIsBookmarked((prev) => !prev);
    },
  });

  // Handlers are async to satisfy expected type signatures.
  const handleLike = async (): Promise<void> => {
    if (!user) {
      router.push(
        "/login?redirect=" + encodeURIComponent(`/gigs/${gigId}`)
      );
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = async (): Promise<void> => {
    if (!user) {
      router.push(
        "/login?redirect=" + encodeURIComponent(`/gigs/${gigId}`)
      );
      return;
    }
    bookmarkMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex">
          <GigsSidebar />
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  if (!gig)
    return <div className="container py-10 text-center">Gig not found</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen flex">
        <GigsSidebar />
        <div className="container py-8 px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section – Gig Details */}
            <div className="lg:col-span-2 space-y-8">
              <GigHeader gig={gig} />
              <GigImageGallery
                gig={gig}
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                onLike={handleLike}
                onBookmark={handleBookmark}
                isOwner={isOwner}
              />
              <GigTabs gig={gig} isOwner={isOwner} />
            </div>
            {/* Right Sidebar – Pricing & Order */}
            <div className="lg:col-span-1">
              <GigSidebar gig={gig} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap the page content with QueryClientProvider so that React Query can work.
export default function GigDetailsPage() {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <GigDetailsPageContent />
    </QueryClientProvider>
  );
}
