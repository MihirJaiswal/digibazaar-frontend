import Link from "next/link"
import { ArrowRight, BarChart3, Layers, MessageSquare, ShoppingCart, Zap } from "lucide-react"
import ServiceCard from "./service-card"
import { HeroVideoDialog } from "../ui/hero-video-dialog"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background ">
      <main>
        <section className="py-20 dark:bg-gradient-to-b dark:from-black" id="services">
          <div className="container max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Everything you need to build, grow, and scale your online business in one powerful platform.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ServiceCard
                icon={<Layers className="h-10 w-10" />}
                title="Customizable Templates"
                description="Choose from hundreds of professionally designed templates and customize them to match your brand identity."
                gradientFrom="from-pink-500"
                gradientTo="to-orange-500"
              />
              <ServiceCard
                icon={<ShoppingCart className="h-10 w-10" />}
                title="E-commerce Integration"
                description="Seamlessly integrate payment gateways, inventory management, and shipping solutions for your online store."
                gradientFrom="from-blue-500"
                gradientTo="to-purple-500"
                className="lg:translate-y-12"
              />
              <ServiceCard
                icon={<Zap className="h-10 w-10" />}
                title="Store Building"
                description="Build your online store with our intuitive drag-and-drop builder. No coding skills required."
                gradientFrom="from-green-500"
                gradientTo="to-teal-500"
              />
              <ServiceCard
                icon={<MessageSquare className="h-10 w-10" />}
                title="Marketing Tools"
                description="Grow your audience with built-in SEO tools, email marketing, and social media integration."
                gradientFrom="from-yellow-500"
                gradientTo="to-amber-500"
                className="lg:translate-y-12"
              />
              <ServiceCard
                icon={<BarChart3 className="h-10 w-10" />}
                title="Analytics & Insights"
                description="Make data-driven decisions with comprehensive analytics and real-time insights about your customers."
                gradientFrom="from-purple-500"
                gradientTo="to-indigo-500"
              />
              <ServiceCard
                icon={<MessageSquare className="h-10 w-10" />}
                title="24/7 Support"
                description="Get help whenever you need it with our dedicated support team and extensive knowledge base."
                gradientFrom="from-red-500"
                gradientTo="to-pink-500"
                className="lg:translate-y-12"
              />
            </div>
          </div>
        </section>

        <section className="p-28 dark:bg-gradient-to-t from-black">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose DigiBazar?</h2>
                <p className="text-lg text-muted-foreground">
                  We combine cutting-edge technology with user-friendly design to help businesses of all sizes succeed
                  online.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-200 dark:bg-purple-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Intuitive Design</h3>
                      <p className="text-muted-foreground">
                        Our platform is designed to be easy to use, even for beginners.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-200 dark:bg-purple-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Scalable Solutions</h3>
                      <p className="text-muted-foreground">
                        Our platform grows with your business, from startup to enterprise.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-200 dark:bg-purple-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Continuous Innovation</h3>
                      <p className="text-muted-foreground">
                        We're constantly adding new features and improvements to keep you ahead of the competition.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:bg-purple-600">
                  <Link href="/learn-more">Learn More</Link>
                </Button>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">\
                <div className="relative">
                    <HeroVideoDialog
                      className="block dark:hidden"
                      animationStyle="from-center"
                      videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                      thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
                      thumbnailAlt="Hero Video"
                    />
                    <HeroVideoDialog
                      className="hidden dark:block"
                      animationStyle="from-center"
                      videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                      thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
                      thumbnailAlt="Hero Video"
                    />
                  </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

