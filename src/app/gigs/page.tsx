import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import HeroSection from "@/components/gigs/HeroSection";

export default function Home() {

  return (
    <div>
      <Header />

      {/* Sidebar & Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <GigsSidebar />
        <HeroSection/>
      </div>
    </div>
  );
}
