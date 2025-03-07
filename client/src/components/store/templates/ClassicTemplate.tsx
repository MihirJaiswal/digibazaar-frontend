// components/store/templates/ClassicTemplate.jsx
"use client"

import { Button } from "@/components/ui/button"

export function ClassicTemplate({ viewMode, currentPage }: { viewMode: string, currentPage: string }) {
  return (
    <div className="min-h-[600px] bg-gray-100">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="text-xl font-serif font-bold">Classic Store</div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-serif font-medium">Home</a>
          <a href="#" className="text-sm font-serif font-medium">Products</a>
          <a href="#" className="text-sm font-serif font-medium">About</a>
          <a href="#" className="text-sm font-serif font-medium">Contact</a>
        </nav>
      </header>
      <main>
        <section className="py-12 text-center">
          <h1 className="text-3xl font-serif font-bold">Welcome to the Classic Store</h1>
          <p className="max-w-2xl mx-auto text-muted">
            Enjoy a timeless design that focuses on tradition and quality.
          </p>
          <div className="mt-4">
            <Button>Discover More</Button>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center">
        <p className="text-sm text-muted">© 2023 Classic Store. All rights reserved.</p>
      </footer>
    </div>
  )
}
