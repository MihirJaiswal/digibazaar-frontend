import Image from "next/image"
import { ChevronDown, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"


export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white dark:bg-zinc-900 px-4 py-8 md:px-5 md:py-10">
      {/* Background decorative elements */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div 
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-secondary/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]  
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </motion.div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left column - Text content */}
          <motion.div 
            className="flex flex-col justify-center space-y-6 md:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <motion.h1 
                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Join the Ultimate <span className="text-primary">eCommerce Hub</span>
              </motion.h1>

              <motion.p 
                className="max-w-[600px] text-sm md:text-base lg:text-xl text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Connect with store owners, warehouse managers, and eCommerce professionals to share insights, discuss
                strategies, and scale your business to new heights.
              </motion.p>
            </div>

            {/* Community selection */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href='/community/communities/explore' >
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Start a Discussion
                  </Button>
                  </Link>
                </motion.div>
              </div>

              <p className="text-sm text-muted-foreground">Ask questions, get expert advice, and grow your business.</p>
            </motion.div>
          </motion.div>

          {/* Right column - Visual content */}
          <div className="relative flex items-center justify-center lg:justify-end">
  <motion.div 
    className="relative h-[380px] sm:h-[420px] md:h-[460px] w-full max-w-[500px] overflow-hidden rounded-lg border bg-background/50 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.8 }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
    
    {/* Community Cards */}
    <motion.div 
      className="absolute left-4 top-6 sm:top-8 h-[160px] sm:h-[180px] w-[250px] sm:w-[280px] rounded-lg bg-card p-3 sm:p-4 shadow-lg"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <h3 className="font-semibold text-sm sm:text-base">eCommerce Growth Hacks</h3>
      <p className="text-xs text-muted-foreground">20,453 members</p>
      <p className="text-xs sm:text-sm mt-2 sm:mt-4">Discuss marketing strategies, SEO tips, and sales-boosting techniques.</p>
      <Button size="sm" variant="outline" className="w-full mt-2 sm:mt-3 text-xs sm:text-sm">
        Join Now
      </Button>
    </motion.div>

    <motion.div 
      className="absolute bottom-6 sm:bottom-8 right-4 h-[160px] sm:h-[180px] w-[250px] sm:w-[280px] rounded-lg bg-card p-3 sm:p-4 shadow-lg"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      <h3 className="font-semibold text-sm sm:text-base">Warehouse & Logistics</h3>
      <p className="text-xs text-muted-foreground">12,762 members</p>
      <p className="text-xs sm:text-sm mt-2 sm:mt-4">Optimize inventory management, shipping, and warehouse automation.</p>
      <Button size="sm" variant="outline" className="w-full mt-2 sm:mt-3 text-xs sm:text-sm">
        Join Now
      </Button>
    </motion.div>
  </motion.div>

  {/* Center Logo */}
  <motion.div 
    className="absolute md:left-1/2 top-44 -translate-x-1/2 -translate-y-1/2 transform z-20"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.2, duration: 0.8, type: "spring", stiffness: 200 }}
  >
    <motion.div 
      className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      whileHover={{ scale: 1.1, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
    >
      <Image
        src="/logo.png"
        alt="Community"
        width={96}
        height={96}
        className="object-cover rounded-full"
      />
    </motion.div>
  </motion.div>
</div>

        </div>

        {/* Stats section */}
        <div className="mt-12 md:mt-16 lg:mt-24 grid grid-cols-2 gap-3 sm:gap-4 pb-8 sm:pb-16 sm:grid-cols-4">
          {[ 
            { label: "Business Owners", value: "30K+" },
            { label: "Active Discussions", value: "5K+" },
            { label: "Expert Insights Daily", value: "1.2K+" },
            { label: "Countries Represented", value: "80+" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border bg-card p-3 sm:p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{stat.value}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}