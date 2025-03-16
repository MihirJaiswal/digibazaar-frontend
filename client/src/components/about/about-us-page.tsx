"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink, ArrowRight, Github, Instagram, Linkedin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "../global/Header"
import Footer from "../global/Footer"
import DocsSidebar from "./sidebar"

export function AboutUsPage() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("introduction")
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Update active section based on scroll position
      const sections = document.querySelectorAll("[data-section]")
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        if (sectionTop < 200 && sectionTop > -200) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between md:bg-white md:dark:bg-black md:p-8 rounded-lg md:border">
            <div className="flex-1 space-y-5">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
                Established 2025
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">Welcome to DigiBazaar</h2>
              <p className="text-md md:text-lg text-muted-foreground leading-relaxed font-normal">
              DigiBazaar is a digital marketplace designed to connect buyers and sellers in a secure, efficient, and user-friendly environment. Launched in 2025, it provides a platform for freelance services, expert hiring, community discussions, and eCommerce store creation—all in one place.
              </p>
              <p className="text-md md:text-lg text-muted-foreground leading-relaxed">
                Our platform leverages the latest technologies to provide a seamless experience for all users, whether
                you're looking to buy, sell, or simply explore what the digital marketplace has to offer.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="/auth/login">
                <Button>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </div>
            </div>
            <div className="relative w-full h-full md:w-1/2 bg-white dark:bg-black md:bg-transparent dark:md:bg-transparent rounded-xl overflow-hidden flex items-center justify-center">
                <Image
                src="/logo2.png"
                alt="DigiBazaar Image"
                width={400}
                height={300}
                loading="lazy"
                quality={100}
                className="md:w-84 md:h-full h-48 object-cover contrast-200"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {[
                {
                    "title": "Community",
                    "subtitle": "Buyers & Sellers",
                    "description": "Connecting users in a seamless digital marketplace"
                  },
                  {
                    "title": "Catalog",
                    "subtitle": "Products & Services",
                    "description": "A diverse range of digital offerings across multiple categories"
                  },
                  {
                    "title": "Reliability",
                    "subtitle": "High Availability",
                    "description": "Designed for smooth and uninterrupted user experience"
                  }
            ].map((stat, i) => (
              <Card key={i} className="border bg-gay-100 dark:bg-black hover:bg-card/80 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-primary">{stat.title}</CardTitle>
                  <CardDescription className="text-base font-medium">{stat.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "mission",
      title: "Our Mission",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-lg border p-8 bg-gradient-to-br dark:from-zinc-900 via-zinc-950 dark:to-black">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
                Our Purpose
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4 max-w-3xl">
                At DigiBazaar, our mission is to democratize digital commerce by creating an accessible, secure, and
                innovative marketplace that empowers individuals and businesses of all sizes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Core Values</CardTitle>
                <CardDescription className="text-base">The principles that guide everything we do</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Innovation",
                    description: "Constantly improving our platform with cutting-edge technology",
                  },
                  { title: "Integrity", description: "Maintaining the highest standards of honesty and transparency" },
                  {
                    title: "Inclusivity",
                    description: "Creating opportunities for everyone, regardless of background",
                  },
                  { title: "Security", description: "Protecting our users' data and transactions at all costs" },
                  {
                    title: "Customer-centricity",
                    description: "Putting our users' needs at the heart of everything we do",
                  },
                ].map((value, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-base">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Our Vision</CardTitle>
                <CardDescription className="text-base">Where we're headed in the future</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We envision a world where digital commerce is accessible to everyone, where creators and entrepreneurs
                  can easily monetize their skills and products, and where buyers can discover unique digital offerings
                  with confidence and security.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By 2030, we aim to become the world's leading platform for digital commerce, known for our:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Innovative technology that sets industry standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Global community of satisfied users across all continents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Positive impact on the digital economy and entrepreneurship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Commitment to security, privacy, and user empowerment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
        id: "about",
        title: "About Me",
         icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
        "content": (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
                The Creator of DigiBazaar
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-4">Meet the Developer</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                DigiBazaar is built and maintained by <strong>Mihir Jaiswal</strong>, a passionate developer dedicated to 
                creating a seamless digital marketplace for freelancers, businesses, and entrepreneurs.
              </p>
            </div>
      
            <div className="flex flex-col items-center">
              <Card className="overflow-hidden border group hover:shadow-md transition-all max-w-sm">
                <div className="aspect-square relative bg-muted">
                  <Image 
                  src="/mihir.jpg"
                   alt="Mihir Jaiswal"
                   height={500}
                   width={500}
                   loading="lazy"
                   quality={100}
                   className="object-cover object-center w-full h-full" />
                   
                </div>
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-lg font-semibold">Mihir Jaiswal</CardTitle>
                  <CardDescription className="text-primary font-medium text-sm">Founder & Developer</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    Full-stack developer passionate about building **scalable, user-friendly platforms** that empower 
                    freelancers and businesses.
                  </p>
                </CardContent>
                <CardFooter className="border-t flex justify-center gap-4 py-3">
                    <Link
                        href="https://www.instagram.com/mihir_jaiswal_/"
                        className="text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                    >
                        <Instagram className="h-4 w-4" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/mihir-jaiswal-322898287/"
                        className="text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                    >
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                    </Link>
                    <Link
                        href="https://github.com/MihirJaiswal"
                        className="text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                    >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    </CardFooter>
              </Card>
            </div>
      
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="gap-2">
                Contact Me
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      },
    {
      id: "services",
      title: "Our Services",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
              What We Offer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">Our Services</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              DigiBazaar offers a comprehensive suite of services designed to facilitate seamless digital commerce for
              individuals and businesses alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {[
              {
                title: "Digital Marketplace",
                description: "A secure platform for buying and selling digital products and services.",
                features: [
                  "Intuitive listing creation and management",
                  "Advanced search and discovery features",
                  "Secure transaction processing",
                  "Automated delivery of digital products",
                ],
                icon: (
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    🛒
                  </div>
                ),
              },
              {
                title: "Secure Payment Processing",
                description: "Multiple payment options with industry-leading security measures.",
                features: [
                  "Support for major credit cards and digital wallets",
                  "Cryptocurrency payment options",
                  "Escrow services for service-based transactions",
                  "Automated invoicing and receipt generation",
                ],
                icon: (
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    💳
                  </div>
                ),
              },
              {
                title: "Seller Tools & Analytics",
                description: "Comprehensive tools to help sellers manage listings and track performance.",
                features: [
                  "Real-time sales and traffic analytics",
                  "Customer behavior insights",
                  "Inventory management tools",
                  "Marketing and promotion features",
                ],
                icon: (
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    📊
                  </div>
                ),
              },
              {
                title: "Buyer Protection",
                description: "Guarantees and safeguards to ensure buyer satisfaction with every purchase.",
                features: [
                  "Money-back guarantee for eligible purchases",
                  "Secure dispute resolution process",
                  "Verified seller program",
                  "Product quality assurance",
                ],
                icon: (
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    🛡️
                  </div>
                ),
              },
            ].map((service, index) => (
              <Card key={index} className="border hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    {service.icon}
                    <div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription className="text-base mt-1">{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-3"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="ghost" className="gap-2 text-primary">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "how-it-works",
      title: "How It Works",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
              Platform Guide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">How DigiBazaar Works</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              Our platform is designed to be intuitive and user-friendly, making digital commerce accessible to
              everyone.
            </p>
          </div>

          <Tabs defaultValue="buyers" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="buyers">For Buyers</TabsTrigger>
              <TabsTrigger value="sellers">For Sellers</TabsTrigger>
            </TabsList>
            <TabsContent value="buyers" className="mt-6">
              <Card className="border">
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {[
                      {
                        step: 1,
                        title: "Create Your Account",
                        description: "Sign up for free in just a few seconds with your email or social media accounts.",
                      },
                      {
                        step: 2,
                        title: "Browse Products & Services",
                        description: "Explore thousands of digital products and services across multiple categories.",
                      },
                      {
                        step: 3,
                        title: "Find What You Need",
                        description: "Use advanced filters and search to discover exactly what you're looking for.",
                      },
                      {
                        step: 4,
                        title: "Secure Checkout",
                        description: "Purchase securely using your preferred payment method with buyer protection.",
                      },
                      {
                        step: 5,
                        title: "Instant Delivery",
                        description:
                          "Download digital products instantly or arrange service delivery through our platform.",
                      },
                      {
                        step: 6,
                        title: "Leave Feedback",
                        description: "Share your experience and help the community with honest reviews.",
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 flex justify-center py-4">
                  <Button className="gap-2">
                    Start Shopping Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="sellers" className="mt-6">
              <Card className="border">
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {[
                      {
                        step: 1,
                        title: "Create a Account",
                        description:
                          "Sign up for a seller account and complete the verification process to establish trust.",
                      },
                      {
                        step: 2,
                        title: "Create Detailed Listings",
                        description:
                          "Use our intuitive tools to create compelling listings for your digital products or services.",
                      },
                      {
                        step: 3,
                        title: "Set Pricing & Availability",
                        description: "Define your pricing strategy, discounts, and availability to maximize sales.",
                      },
                      {
                        step: 4,
                        title: "Receive & Manage Orders",
                        description:
                          "Get notified of new orders and communicate with buyers through our secure messaging system.",
                      },
                      {
                        step: 5,
                        title: "Deliver Products or Services",
                        description:
                          "Fulfill orders through our secure platform with automated or manual delivery options.",
                      },
                      {
                        step: 6,
                        title: "Get Paid & Grow",
                        description:
                          "Receive payments promptly with low transaction fees and access detailed analytics to scale your business.",
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 flex justify-center py-4">
                  <Link href='/auth/login'>
                  <Button className="gap-2">
                    Become a Seller
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
    {
      id: "technology",
      title: "Technology Stack",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
              Under the Hood
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">Our Technology Stack</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              At DigiBazaar, we pride ourselves on using cutting-edge technology to deliver a fast, secure, and scalable
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border bg-gradient-to-br from-purple-50 to-white dark:from-zinc-900 dark:to-black overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                    </svg>
                  </div>
                  <CardTitle>Frontend</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { name: "React.js", description: "For dynamic user interfaces" },
                    { name: "Next.js", description: "For server-side rendering and optimal performance" },
                    { name: "Tailwind CSS", description: "For responsive design" },
                  ].map((tech, i) => (
                    <li key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">{tech.name}</h3>
                        <p className="text-sm text-muted-foreground">{tech.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border bg-gradient-to-br from-purple-50 to-white dark:from-zinc-900 dark:to-black overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                      <line x1="6" y1="6" x2="6.01" y2="6"></line>
                      <line x1="6" y1="18" x2="6.01" y2="18"></line>
                    </svg>
                  </div>
                  <CardTitle>Backend</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
              
                { "name": "Node.js", "description": "For API services and server-side logic" },
                { "name": "Prisma", "description": "For database ORM and efficient query handling" },
                { "name": "MySQL", "description": "For structured data storage and management" }
              
              
                  ].map((tech, i) => (
                    <li key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">{tech.name}</h3>
                        <p className="text-sm text-muted-foreground">{tech.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline" className="gap-2">
              Read Our Technical Blog
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: <div className="size-2 rounded-full bg-purple-700 mr-2" />,
      content: (
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20 text-primary">
              Get in Touch
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">Contact Us</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, our team is
              here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Card className="border">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "General Inquiries",
                      details: [
                        "Email: jaiswalmihir.business@gmail.com",
                        "Phone: 8871299913",
                        "Hours: Monday-Friday, 9am-5pm IST",
                      ],
                    },
                  ].map((contact, i) => (
                    <div key={i} className="rounded-lg border p-4 bg-card/50">
                      <h3 className="font-bold text-sm">{contact.title}</h3>
                      <div className="mt-2 space-y-1">
                        {contact.details.map((detail, j) => (
                          <p key={j} className="text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-bold text-sm">Office Location</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    DigiBazaar Headquarters
                    <br />
                    Sanchar Nagar Main, Indore
                    <br />
                    Indore, M.P.
                    <br />
                   India
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
  {[
    {
      name: "Github",
      href: "https://github.com/MihirJaiswal",
      icon: <Github className="h-6 w-6" />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/mihir-jaiswal-322898287/",
      icon: <Linkedin className="h-6 w-6" />,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/mihir_jaiswal_/",
      icon: <Instagram className="h-6 w-6" />,
    },
  ].map((social, i) => (
    <Link
      key={i}
      href={social.href}
      className="text-muted-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
    >
      <span className="sr-only">{social.name}</span>
      {social.icon}
    </Link>
  ))}
</div>

              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <input id="name" placeholder="Your name" className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <input
                      id="subject"
                      placeholder="How can we help?"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      placeholder="Your message"
                      rows={5}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    ></textarea>
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-900">
  <Header />
  <div className="container flex-1 py-6 lg:py-12">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr] lg:gap-10">
      <aside className="sticky top-16 self-start overflow-y-auto lg:h-[calc(100vh-4rem)]">
      <DocsSidebar
          sections={sections.map((section, index) => ({
            title: section.title,
            items: [], // If you want to add subsections, add them here
          }))}
          activeSection={sections.findIndex(section => section.id === activeSection)}
          setActiveSection={(index) => setActiveSection(sections[index].id)}
        />
      </aside>
      <main className="relative w-full min-w-0 px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight leading-tight">
              About DigiBazaar
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-normal leading-relaxed">
              Learn about our company, mission, and the team behind DigiBazaar
            </p>
          </div>
          <div className="space-y-16">
            {sections.map((section) => (
              <div 
                key={section.id} 
                id={section.id} 
                data-section={section.id} 
                className="pb-10 scroll-mt-16"
              >
                {section.content}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
  <Footer />
</div>
  )
}

interface DocsSidebarNavProps {
  sections: {
    id: string
    title: string
    icon?: React.ReactNode
    content: React.ReactNode
  }[]
  activeSection: string
  setActiveSection: (id: string) => void
}

function DocsSidebarNav({ sections, activeSection, setActiveSection }: DocsSidebarNavProps) {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      <nav className="grid grid-flow-row auto-rows-max text-sm">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted hover:text-primary transition-colors",
              activeSection === section.id ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground",
            )}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
              setActiveSection(section.id)
            }}
          >
            {section.icon}
            {section.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

interface MobileNavProps {
  sections: {
    id: string
    title: string
    icon?: React.ReactNode
    content: React.ReactNode
  }[]
  setActiveSection: (id: string) => void
  setOpen: (open: boolean) => void
}

function MobileNav({ sections, setActiveSection, setOpen }: MobileNavProps) {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      <div className="flex flex-col space-y-3">
        <Link href="/" className="flex items-center gap-1 text-lg font-semibold" onClick={() => setOpen(false)}>
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
            DB
          </div>
          DigiBazaar
        </Link>
        <div className="flex flex-col space-y-2 mt-4">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-muted/50 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                setActiveSection(section.id)
                setOpen(false)
              }}
            >
              {section.icon}
              {section.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

