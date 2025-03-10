import Image from "next/image"
import { ChevronDown, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left column - Text content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Users className="mr-2 h-4 w-4" />
                Join 50,000+ community members
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl  bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-500">
                Connect with your <span className="text-primary">perfect</span> community
              </h1>

              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover, join, and contribute to communities that match your interests. Share ideas, get feedback, and
                build connections that matter.
              </p>
            </div>

            {/* Community selection */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-[240px]">
                  <Button variant="outline" className="w-full justify-between">
                    Select a community
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </div>

                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create Post
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">Select a community to create a post</p>
            </div>
          </div>

          {/* Right column - Visual content */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-lg border bg-background/50 shadow-xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />

              {/* Community cards */}
              <div className="absolute left-4 top-8 h-[180px] w-[280px] rounded-lg bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt="Community"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Design Enthusiasts</h3>
                    <p className="text-xs text-muted-foreground">12,453 members</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">Latest discussions on UI/UX trends and tools for modern design workflows.</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Join Community
                  </Button>
                </div>
              </div>

              <div className="absolute bottom-8 right-4 h-[180px] w-[280px] rounded-lg bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary">
                    <Image
                      src="/placeholder.svg?height=48&width=48"
                      alt="Community"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tech Innovators</h3>
                    <p className="text-xs text-muted-foreground">8,762 members</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    Discuss emerging technologies and share your innovative projects with peers.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Join Community
                  </Button>
                </div>
              </div>

              {/* Center icon */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Community"
                    width={64}
                    height={64}
                    className="object-cover"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 gap-4 pb-16 sm:grid-cols-4 md:mt-24">
          {[
            { label: "Communities", value: "500+" },
            { label: "Active Members", value: "50K+" },
            { label: "Posts Daily", value: "2.5K+" },
            { label: "Countries", value: "120+" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center"
            >
              <span className="text-2xl font-bold sm:text-3xl">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

