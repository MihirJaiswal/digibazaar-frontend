"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store as StoreIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchStores() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:8800/api/stores/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await res.json();
        // Optionally, filter for published stores:
        const publishedStores = data.filter((store: any) => store.isPublished);
        setStores(publishedStores);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Discover Our Stores
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Browse through our collection of unique online stores created by
            entrepreneurs like you.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden bg-muted">
              <Image
                src={store.logo || "/placeholder.svg?height=300&width=600"}
                alt={store.name}
                width={600}
                height={300}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.tagline}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {store.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/store/stores/${store.name}`}>
                  Visit Store
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/create-store">
            <StoreIcon className="mr-2 h-4 w-4" />
            Create Your Own Store
          </Link>
        </Button>
      </div>
    </div>
  );
}
