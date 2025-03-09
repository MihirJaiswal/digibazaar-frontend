import Link from "next/link"
import { ArrowRight, BarChart3, Layers, MessageSquare, ShoppingCart, Zap } from "lucide-react"
import ServiceCard from "./service-card"
import AnimatedGradient from "@/components/ui/animated-gradient"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background ">
      <main>
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-purple-100 via-blue-100 to-white dark:bg-gradient-to-b dark:from-yellow-950 dark:to-black">
          <AnimatedGradient className="absolute inset-0 -z-10" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Cutting-Edge Solutions for Your Digital Presence
              </h1>
              <p className="mb-10 text-xl text-muted-foreground">
                Discover how DigiBazar's innovative platform can transform your online business with customizable
                templates and powerful tools.
              </p>
            </div>
          </div>
        </section>

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

        <section className="py-20  px-24 dark:bg-gradient-to-t from-black">
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
                    <div className="rounded-full bg-primary/10 p-1">
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
                    <div className="rounded-full bg-primary/10 p-1">
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
                    <div className="rounded-full bg-primary/10 p-1">
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
                <Button size="lg" asChild>
                  <Link href="/learn-more">Learn More</Link>
                </Button>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="lg" variant="outline" className="bg-background/80 backdrop-blur-sm">
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
                        className="mr-2 h-5 w-5"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Watch Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

