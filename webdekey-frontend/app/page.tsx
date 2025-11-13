// app/page.tsx
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import ProductGrid from "@/components/user/ProductGrid";
import Footer from "@/components/user/Footer";
import ProductGridByCategory from "@/components/user/ProductGridByCategory";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroBanner />
    
      <div className="pt-16  bg-[#f1f1f1]">
        <div className="max-w-screen-2xl mx-auto px-4 py-12">
          <div className="flex gap-8">
            <div className="w-full">
              {/* Section: Sản phẩm nổi bật */}
              <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <ProductGrid />
                </div>
              </section>

              {/* Section: Sản phẩm theo danh mục */}
              <section className="py-12 md:py-16 lg:py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <ProductGridByCategory />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}