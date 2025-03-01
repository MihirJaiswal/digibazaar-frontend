import { CommunityList } from "@/components/community/community-list"
import { FeaturedPosts } from "@/components/community/featured-posts"
import Header from "@/components/global/Header"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div>
      <Header/>
      <section className="space-y-4">
        <div className="text-center space-y-2 py-10">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Redditly</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our communities, share your thoughts, and discover interesting content from people around the world.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button asChild>
              <Link href="/communities">
                Browse Communities <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Popular Communities</h2>
          <Button variant="link" asChild>
            <Link href="/communities">View All</Link>
          </Button>
        </div>
        <CommunityList />
      </section>
    </div>
  )
}

