"use client";

import { useParams } from "next/navigation";
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import Footer from "@/components/user/Footer";
import ProductListByCategory from "@/components/user/ProductListByCategory";

export default function CategoryPage() {
  const { slug } = useParams();

  // Nếu slug là mảng, lấy phần tử đầu tiên, nếu undefined thì dùng rỗng
  const categorySlug = Array.isArray(slug) ? slug[0] : slug ?? "";

  // Nếu slug rỗng, có thể hiển thị loading hoặc thông báo
  if (!categorySlug) return <div>Đang tải...</div>;

  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      <Header />
      <HeroBanner />

      <main className="pt-16">
        <div className="max-w-screen-2xl mx-auto px-4 py-12">
          <div className="flex gap-8">
            <div className="w-full">
              {/* Section: Sản phẩm theo danh mục */}
              <section className="py-12 md:py-16 lg:py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <ProductListByCategory slug={categorySlug} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
