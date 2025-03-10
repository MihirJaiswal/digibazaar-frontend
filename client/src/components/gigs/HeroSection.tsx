"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("hire")

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pb-16 pt-24 md:pb-24  px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-10%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left column: Text content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <motion.h1
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Connect with top freelance talent <span className="text-primary">instantly</span>
              </motion.h1>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl/relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                The easiest way to hire experts or find work in design, development, marketing, and more.
              </motion.p>
            </div>

            {/* Tabs for different user journeys */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="hire" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hire">Hire Talent</TabsTrigger>
                  <TabsTrigger value="work">Find Work</TabsTrigger>
                </TabsList>
                <TabsContent value="hire" className="mt-4 space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        <p className="text-sm text-muted-foreground">Find the perfect freelancer for your project</p>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                          
                          <Button variant="outline" className="flex-1 gap-1" size="lg">
                            Browse Freelancers <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="work" className="mt-4 space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        <p className="text-sm text-muted-foreground">Create your profile and start finding clients</p>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                          <Button className="flex-1 gap-1" size="lg">
                            Register as Freelancer <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-4 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">20k+ Freelancers</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">10k+ Projects Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted"
                    >
                      <span className="text-[10px]">★</span>
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5 Average Rating</span>
              </div>
            </motion.div>
          </div>

          {/* Right column: Image */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden backdrop-blur-sm md:h-[500px]">
              <Image
                src="/logo.png"
                alt="Freelancers collaborating"
                fill
                className="object-cover"
                loading="lazy"
                quality={100}
              />

              {/* Floating cards */}
              <div className="absolute -left-6 top-12 w-48 rounded-lg border bg-background p-3 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Sarah J.</p>
                    <p className="text-[10px] text-muted-foreground">UI/UX Designer</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/20" />
                </div>
              </div>

              <div className="absolute -right-6 bottom-16 w-48 rounded-lg border bg-background p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Michael T.</p>
                    <p className="text-[10px] text-muted-foreground">Full-Stack Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

