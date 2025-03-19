"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  StoreIcon,
  Search,
  Tag,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import React from "react";

interface StoreData {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  logo?: string;
  tagline?: string;
  // extra UI enhancements added on client side:
  category: string;
  isNew: boolean;
  isTrending: boolean;
  products: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  // raw input (immediate) and debounced search term:
  const [rawSearchQuery, setRawSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { token, user} = useAuthStore();

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("http://localhost:8800/api/stores/all");
        if (!res.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data: StoreData[] = await res.json();
        // Filter for published stores:
        const publishedStores = data.filter((store) => store.isPublished);
        // Enhance with mock categories and metrics:
        const enhancedStores = publishedStores.map((store, index) => ({
          ...store,
          category: ["Fashion", "Electronics", "Home Decor", "Food", "Art"][index % 5],
          isNew: index % 3 === 0,
          isTrending: index % 4 === 0,
          products: Math.floor(Math.random() * 50) + 5,
        }));
        setStores(enhancedStores);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [token]);

  // Debounce search input by 300ms:
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(rawSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [rawSearchQuery]);

  // Compute filtered stores based on search query and category
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesCategory =
        categoryFilter === "all" ||
        store.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [stores, searchQuery, categoryFilter]);

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const createStoreLink = user ? "/store/create" : "/auth/login";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/60 mx-auto max-w-7xl p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video h-[200px] w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900">
      <div className="min-h-screen mx-auto max-w-7xl px-6">
        {/* Hero Section with Pattern Background */}
        <div className="relative overflow-hidden py-16">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                backgroundSize: "24px 24px",
              }}
            ></div>
          </div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
                Discover Our Marketplace
              </h1>
              <p className="mx-auto max-w-[800px] text-lg text-muted-foreground md:text-xl">
                Explore a curated collection of unique online stores created by
                innovative entrepreneurs from around the world.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search stores by name or category..."
                    className="pl-10 pr-4 bg-white dark:bg-zinc-950"
                    value={rawSearchQuery}
                    onChange={(e) => setRawSearchQuery(e.target.value)}
                  />
                </div>
                  <Button asChild variant="default" className="w-full sm:w-auto">
                    <Link href={createStoreLink}>
                      <StoreIcon className="mr-2 h-4 w-4" />
                      Create Your Store
                    </Link>
                  </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-12">
          {/* Category Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <div className="flex flex-wrap items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-5 text-xs">
                <TabsTrigger value="all" onClick={() => handleCategoryFilter("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger value="fashion" onClick={() => handleCategoryFilter("Fashion")}>
                  Fashion
                </TabsTrigger>
                <TabsTrigger value="electronics" onClick={() => handleCategoryFilter("Electronics")}>
                  Tech
                </TabsTrigger>
                <TabsTrigger value="home" onClick={() => handleCategoryFilter("Home Decor")}>
                  Home
                </TabsTrigger>
                <TabsTrigger value="food" onClick={() => handleCategoryFilter("Food")}>
                  Food
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Empty State */}
          {filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <StoreIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-xl font-medium">No stores found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? "Try a different search term or browse all stores."
                  : "Be the first to create a store!"}
              </p>
              {/* Only show the Create Your Store button if the user is logged out */}
              {!token && (
                <Button asChild className="mt-6">
                  <Link href={createStoreLink}>Create Your Store</Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Stores Section */}
              {filteredStores.some((store) => store.isTrending) && (
                <div className="mb-12">
                  <div className="mb-6 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Trending Stores</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStores
                      .filter((store) => store.isTrending)
                      .slice(0, 3)
                      .map((store) => (
                        <StoreCard key={store.id} store={store} featured={true} />
                      ))}
                  </div>
                </div>
              )}

              {/* All Stores Grid */}
              <div className="mb-6 flex items-center">
                <StoreIcon className="mr-2 h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">All Stores</h2>
                <p className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredStores.length}{" "}
                  {filteredStores.length === 1 ? "store" : "stores"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoized StoreCard component to prevent unnecessary re-renders
const StoreCard = React.memo(function StoreCard({
  store,
  featured = false,
}: {
  store: StoreData;
  featured?: boolean;
}) {
  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${
        featured ? "border-primary/20 bg-primary/5" : ""
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={store.logo || "/placeholder.svg?height=300&width=600"}
          alt={store.name}
          width={600}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {store.isNew && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              <Clock className="mr-1 h-3 w-3" /> New
            </Badge>
          )}
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Tag className="mr-1 h-3 w-3" /> {store.category}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{store.name}</CardTitle>
          {store.isTrending && (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
              <TrendingUp className="mr-1 h-3 w-3" /> Trending
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-1">{store.tagline}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <StoreIcon className="mr-1 h-3 w-3" />
            <span>{store.products} Products</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-cyan-500">
          <Link href={`/store/stores/${store.name}`} target="_blank"> 
            Visit Store
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});
