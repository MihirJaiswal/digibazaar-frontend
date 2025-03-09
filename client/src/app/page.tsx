import Header from '@/components/global/Header'
import { About } from '@/components/home/About'
import Hero from '@/components/home/Hero'
import Footer from '@/components/global/Footer'
import Cta from '@/components/home/Cta'
import ServicesPage from '@/components/home/Process'

export default function page() {
  return (
    <div>
      <Header/>
      <Hero/>
      <ServicesPage/>
      <About/>
      <Cta/>
      <Footer/>
    </div>
  )
}
