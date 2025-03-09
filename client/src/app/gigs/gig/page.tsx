"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GigCard } from "@/components/gigs/gig-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, X, Plus, Briefcase, ChevronDown } from 'lucide-react';
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
  price: number;
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
  deliveryTime: number;
  cover: string;
}

// Default categories (static list)
const defaultCategories: Category[] = [
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
  { value: "CONTENT_WRITING", label: "Content Writing" },
  { value: "VIDEO_ANIMATION", label: "Video & Animation" },
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "DATA_ANALYTICS", label: "Data Analytics" },
  { value: "BUSINESS", label: "Business Consulting" },
  { value: "AUDIO_PRODUCTION", label: "Audio Production" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VIRTUAL_ASSISTANTS", label: "Virtual Assistants" },
];

export default function GigsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Initialize categories state with the default categories plus an "All" option.
  const [categories, setCategories] = useState<Category[]>([
    { value: "All", label: "All Categories" },
    ...defaultCategories,
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [deliveryTime, setDeliveryTime] = useState<number[]>([30]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilters, setActiveFilters] = useState<number>(0);

  const itemsPerPage = 9;

  // Fetch categories dynamically and merge with defaultCategories
  useEffect(() => {
    fetch("http://localhost:8800/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const fetchedCategories: Category[] = Array.isArray(data) ? data : data.categories ?? [];
        // Merge "All" + defaultCategories with fetched ones (avoiding duplicates)
        const mergedCategories = [
          { value: "All", label: "All Categories" },
          ...defaultCategories,
          ...fetchedCategories.filter(
            (fc) => !defaultCategories.some((dc) => dc.value === fc.value)
          ),
        ];
        setCategories(mergedCategories);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Fetch gigs from API
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8800/api/gigs")
      .then((res) => res.json())
      .then((data) => {
        const gigsArray: Gig[] = Array.isArray(data) ? data : data.gigs ?? [];
        if (gigsArray.length === 0) {
          console.warn("No gigs found, received:", data);
        }
        setGigs(gigsArray);
        setFilteredGigs(gigsArray);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to load gigs");
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    if (!gigs.length) return;
    setIsLoading(true);

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

    results = results.filter((gig) => gig.price >= priceRange[0] && gig.price <= priceRange[1]);
    results = results.filter((gig) => gig.deliveryTime <= deliveryTime[0]);

    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        results.sort((a, b) => b.price - a.price);
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

    setFilteredGigs(results);
    setCurrentPage(1);
    setIsLoading(false);
  }, [searchTerm, selectedCategory, priceRange, deliveryTime, sortBy, gigs]);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (priceRange[0] > 0 || priceRange[1] < 300) count++;
    if (deliveryTime[0] !== 7) count++;
    setActiveFilters(count);
  }, [selectedCategory, priceRange, deliveryTime]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredGigs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGigs = filteredGigs.slice(startIndex, endIndex);

  // Reset filters function
  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 300]);
    setDeliveryTime([30]);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex">
        <GigsSidebar />
        <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Page Title & Create Gig Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Explore Gigs</h1>
              <p className="text-neutral-500 mt-1">Find the perfect services for your project</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <a href="/create-gig">Create a Gig</a>
            </Button>
          </div>

          {/* Search and Sorting */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-neutral-300 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-neutral-300 text-neutral-700">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFilters > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary text-xs">
                          {activeFilters}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md">
                    <div className="flex items-center justify-between mb-6">
                    <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
                      {activeFilters > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetFilters}
                          className="text-neutral-500 hover:text-neutral-900 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      {/* Category Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">Category</h4>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full border-neutral-300">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Price Slider */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">Price Range</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-neutral-500">${priceRange[0]}</span>
                          <span className="text-sm text-neutral-500">${priceRange[1]}</span>
                        </div>
                        <Slider 
                          value={priceRange} 
                          min={0} 
                          max={300} 
                          step={5} 
                          className="py-4"
                          onValueChange={(value) => setPriceRange(value as [number, number])} 
                        />
                      </div>

                      <Separator />

                      {/* Delivery Time Slider */}
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">Delivery Time</h4>
                        <p className="text-sm text-neutral-500 mb-2">Up to {deliveryTime[0]} days</p>
                        <Slider 
                          value={deliveryTime} 
                          min={1} 
                          max={30} 
                          step={1}
                          className="py-4"
                          onValueChange={setDeliveryTime} 
                        />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Button 
                        onClick={resetFilters}
                        className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-neutral-300">
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
            
            {/* Active filters */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                {selectedCategory !== "All" && (
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-50">
                    Category: {categories.find(c => c.value === selectedCategory)?.label}
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
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-50">
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
                
                {deliveryTime[0] !== 7 && (
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-50">
                    Delivery: Up to {deliveryTime[0]} days
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 hover:bg-neutral-200" 
                      onClick={() => setDeliveryTime([7])}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-neutral-600">
              {filteredGigs.length} {filteredGigs.length === 1 ? 'service' : 'services'} available
            </p>
          </div>

          {/* Gigs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden h-full flex flex-col">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-5 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <div className="mt-auto">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGigs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} showDescription={true} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                  <PaginationContent className="mt-10 flex justify-center gap-2">
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                
                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
              <Briefcase className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No gigs found</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                We couldn&apos;t find any gigs matching your current filters. Try adjusting your search criteria.
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
