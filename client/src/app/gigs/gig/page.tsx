"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GigCard } from "@/components/gigs/gig-card";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";
import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";

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
  const [deliveryTime, setDeliveryTime] = useState<number[]>([7]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const itemsPerPage = 6;

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
      results = results.filter(
        (gig) =>
          gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gig.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <GigsSidebar />
        <main className="flex-1 container py-8 px-6 md:px-12">
          {/* Page Title & Create Gig Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Explore Gigs</h1>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <a href="/create-gig">+ Create a Gig</a>
            </Button>
          </div>

          {/* Search and Sorting */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-md shadow-sm">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border border-gray-300 shadow-sm">
                <SelectValue placeholder="Sort by" />
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Gigs Grid */}
            <div className="md:col-span-3">
              {isLoading ? (
                <p className="text-center text-gray-600">Loading gigs...</p>
              ) : filteredGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGigs.slice(0, itemsPerPage).map((gig) => (
                    <GigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No gigs found.</p>
              )}
            </div>
            {/* Filters Sidebar */}
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg min-h-[600px]">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Filters</h2>
              <div className="space-y-8">
                {/* Category Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Category</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
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

                {/* Price Slider */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Price Range</h3>
                  <p className="text-sm text-gray-600 mb-2">${priceRange[0]} - ${priceRange[1]}</p>
                  <Slider 
                    value={priceRange} 
                    min={0} 
                    max={300} 
                    step={5} 
                    onValueChange={(value) => setPriceRange(value as [number, number])} 
                  />
                </div>

                {/* Delivery Time Slider */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Delivery Time</h3>
                  <p className="text-sm text-gray-600 mb-2">{deliveryTime[0]} days</p>
                  <Slider 
                    value={deliveryTime} 
                    min={1} 
                    max={30} 
                    step={1} 
                    onValueChange={setDeliveryTime} 
                  />
                </div>
              </div>
              {/* Reset Filters Button */}
              <div className="mt-8">
                <Button 
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 300]);
                    setDeliveryTime([7]);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md shadow-md"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
