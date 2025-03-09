import dynamic from "next/dynamic"
import Header from "@/components/global/Header"
import Hero from "@/components/home/Hero"
import Footer from "@/components/global/Footer"

const About = dynamic(() => import("@/components/home/About")) // Lazy load
const ServicesPage = dynamic(() => import("@/components/home/Process")) 
const Cta = dynamic(() => import("@/components/home/Cta"))

export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <ServicesPage />
      <About />
      <Cta />
      <Footer />
    </div>
  )
}
