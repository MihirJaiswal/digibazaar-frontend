'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Store, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'

export default function HeroSection() {
  const { token, user } = useAuthStore();

  return (
    <>
      <main className="overflow-hidden w-full bg-white dark:bg-zinc-900">
        <section className="flex justify-center">
          <div className="relative pt-8 w-full max-w-7xl">
            <div className="mx-auto px-6">
              <div className="max-w-3xl text-center mx-auto">
                {/* Tagline */}
                <Link href="/" className="rounded-md mx-auto flex w-fit items-center gap-2 border p-1 pr-3">
                  <span className="bg-muted rounded-md px-2 py-1 text-xs">New</span>
                  <span className="text-sm">Revolutionizing B2B Wholesale</span>
                  <span className="bg-gray-200 dark:bg-gray-700 block h-4 w-px"></span>
                  <ArrowRight className="size-4" />
                </Link>

                {/* Headline */}
                <h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:[line-height:1.125]">
                  Simplifying Bulk Trade
                </h1>

                {/* Description */}
                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                  Connect with verified suppliers, negotiate prices, and manage bulk orders seamlessly.
                  Your one-stop platform for smart wholesale trading.
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                  Buy & sell in bulk, negotiate deals, and grow your business with ease.
                </p>

                {/* Call to Action */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button size="lg" asChild>
                    <Link href="/gigs/gig">
                      <Store className="relative size-4" />
                      <span className="text-nowrap">Explore Wholesale</span>
                    </Link>
                  </Button>

                  {/* Conditional rendering based on login status */}
                  {!token ? (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/auth/login">
                        <Package className="relative size-4" />
                        <span className="text-nowrap">Become a Seller</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/gigs/dashboard">
                        <Package className="relative size-4" />
                        <span className="text-nowrap">Your Dashboard</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mt-16">
              <div aria-hidden className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%" />
              <div className="relative mx-auto max-w-6xl overflow-hidden px-4">
                <Image className="z-2 border-border/25 relative hidden rounded-2xl border dark:block" src="/ss.png" alt="app screen" width={2796} height={2008} quality={100} />
                <Image className="z-2 border-border/25 relative rounded-2xl border dark:hidden" src="/ss2.png" alt="app screen" width={2796} height={2008} quality={100} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
