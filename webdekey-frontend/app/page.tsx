// app/page.tsx
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import Sidebar from "@/components/user/Sidebar";
import ProductGrid from "@/components/user/ProductGrid";
import Footer from "@/components/user/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      <Header />
      <HeroBanner />
    
      <div className="pt-16"> 
        <div className="max-w-screen-2xl mx-auto px-4 py-12">
          <div className="flex gap-8">
            <Sidebar />
            <ProductGrid />
          </div>
        
        </div>
      </div>
      
      <Footer />
    </div>
  );
}