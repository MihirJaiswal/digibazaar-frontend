"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GigCard } from "@/components/gigs/gig-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  X,
  Plus,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DialogTitle } from "@/components/ui/dialog";

interface Category {
  value: string;
  label: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  bulkPrice: number;
  rating: number;
  reviews: number;
  seller: {
    id: string;
    username: string;
    profilePicture: string;
    level: string;
  };
  images: string[];
  category: string;
  tags: string[];
  leadTime: number;
  minOrderQty: number;
  supplyCapacity?: number;
  cover: string;
  features: string[];  // Added property
}


const defaultCategories: Category[] = [
  { value: "FASHION", label: "Fashion" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "GROCERY", label: "Grocery" },
  { value: "HOME_DECOR", label: "Home Decor" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "TOYS", label: "Toys" },
];

const queryClient = new QueryClient();

// Skeleton component for better loading state
const GigCardSkeleton = () => (
  <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
    <Skeleton className="aspect-[4/3] w-full" />
    <CardContent className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-auto pt-3 border-t flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-28" />
      </div>
    </CardContent>
  </Card>
);

function GigsPageContent() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [deliveryTime, setDeliveryTime] = useState<number[]>([30]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilters, setActiveFilters] = useState<number>(0);

  const itemsPerPage = 9;

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8800/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const categories = useMemo(() => {
    const fetchedCategories: Category[] =
      Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories ?? [];
    return [
      { value: "All", label: "All Categories" },
      ...defaultCategories,
      ...fetchedCategories.filter(
        (fc) => !defaultCategories.some((dc) => dc.value === fc.value)
      ),
    ];
  }, [categoriesData]);

  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ["gigs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8800/api/gigs");
      if (!res.ok) throw new Error("Failed to fetch gigs");
      return res.json();
    },
  });

  const gigs: Gig[] = useMemo(() => {
    const gigsArray: Gig[] =
      Array.isArray(gigsData) ? gigsData : gigsData?.gigs ?? [];
    return gigsArray;
  }, [gigsData]);

  const filteredGigs = useMemo(() => {
    let results = [...gigs];
    if (searchTerm) {
      results = results.filter((gig) => {
        const title = gig.title || "";
        const description = gig.description || "";
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    if (selectedCategory !== "All") {
      results = results.filter((gig) => gig.category === selectedCategory);
    }
    results = results.filter(
      (gig) => gig.bulkPrice >= priceRange[0] && gig.bulkPrice <= priceRange[1]
    );
    results = results.filter((gig) => gig.leadTime <= deliveryTime[0]);

    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => a.bulkPrice - b.bulkPrice);
        break;
      case "price-high":
        results.sort((a, b) => b.bulkPrice - a.bulkPrice);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        results = [...results].reverse();
        break;
      default:
        break;
    }
    return results;
  }, [gigs, searchTerm, selectedCategory, priceRange, deliveryTime, sortBy]);

  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (priceRange[0] > 0 || priceRange[1] < 300) count++;
    if (deliveryTime[0] !== 30) count++;
    setActiveFilters(count);
  }, [selectedCategory, priceRange, deliveryTime]);

  const totalPages = Math.ceil(filteredGigs.length / itemsPerPage);
  const currentGigs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGigs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGigs, currentPage]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 300]);
    setDeliveryTime([30]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <Header />
      <div className="flex flex-col md:flex-row">
      <GigsSidebar />
        <div className="w-full md:w-auto">
        </div>
        <main className="py-8 px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Explore Supplier Listings</h1>
              <p className="text-neutral-500 dark:text-neutral-300 mt-1">
                Find the perfect suppliers for your bulk orders.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <a href="/gigs/create-gig">Create a Listing</a>
            </Button>
          </div>

          <div className="rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700 bg-gray-100 dark:bg-zinc-950 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  placeholder="Search for listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-neutral-300 dark:border-gray-700 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-neutral-300 dark:border-gray-700 text-neutral-700"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilters > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-primary/10 text-primary text-xs"
                    >
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-neutral-300 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span>Sort by</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-gray-700">
                {selectedCategory !== "All" && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                  >
                    Category:{" "}
                    {categories.find((c) => c.value === selectedCategory)?.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-neutral-200"
                      onClick={() => setSelectedCategory("All")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {(priceRange[0] > 0 || priceRange[1] < 300) && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                  >
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-neutral-200"
                      onClick={() => setPriceRange([0, 300])}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {deliveryTime[0] !== 30 && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                  >
                    Lead Time: Up to {deliveryTime[0]} days
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-neutral-200"
                      onClick={() => setDeliveryTime([30])}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-neutral-600 dark:text-neutral-200">
              {filteredGigs.length}{" "}
              {filteredGigs.length === 1 ? "listing" : "listings"} available
            </p>
          </div>

          {gigsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <GigCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredGigs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} showDescription={true} />
                ))}
              </div>
              {totalPages > 1 && (<div className="mt-10">
                  <PaginationContent className="flex justify-center gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >{i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 rounded-xl border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-zinc-900">
              <Briefcase className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">No listings found</h3>
              <p className="text-neutral-500 dark:text-neutral-200 max-w-md mx-auto mb-6">
                We couldn&apos;t find any listings matching your current filters.
                Try adjusting your search criteria.
              </p>
              <Button onClick={resetFilters} variant="outline" className="border-neutral-300">
                Reset Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function GigsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <GigsPageContent />
    </QueryClientProvider>
  );
}