import Header from '@/components/global/Header'
import { About } from '@/components/home/About'
import Hero from '@/components/home/Hero'
import Process from '@/components/home/Process'
import Footer from '@/components/global/Footer'
import Cta from '@/components/home/Cta'
import { LogoTicker } from '@/components/home/LogoTicker'
import ServicesPage from '@/components/home/Process'

export default function page() {
  return (
    <div>
      <Header/>
      <Hero/>
      <LogoTicker/>
      <ServicesPage/>
      <About/>
      <Cta/>
      <Footer/>
    </div>
  )
}
