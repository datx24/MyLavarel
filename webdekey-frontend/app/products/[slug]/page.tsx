"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import api from "@/utils/api";
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import Footer from "@/components/user/Footer";
import ProductCard from "@/components/user/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  original_price?: number | string | null;
  description?: string;
  image?: string;
  is_new?: boolean | number;
  is_hot?: boolean | number;
  category_id?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [suggestProducts, setSuggestProducts] = useState<Product[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const getImageUrl = (image?: string) => {
    if (!image) return "/logo/banner.jpg";
    return image.startsWith("http")
      ? image
      : `http://127.0.0.1:8000/storage/${image}`;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchProductAndSuggest = async () => {
      try {
        // 1️⃣ Lấy chi tiết sản phẩm
        const res = await api.get(`/products/slug/${slug}`);
        setProduct(res.data);

        if (res.data.category_id) {
          // 2️⃣ Lấy slug category từ category_id
          const catRes = await api.get(`/categories/${res.data.category_id}`);
          const categorySlug: string = catRes.data.slug;

          // 3️⃣ Lấy sản phẩm gợi ý cùng category
          const suggestRes = await api.get(`/products/category/${categorySlug}`);
          setSuggestProducts(
            suggestRes.data.products.filter((p: Product) => p.id !== res.data.id)
          );
        }
      } catch (err) {
        console.error("Không tìm thấy sản phẩm hoặc category:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndSuggest();
  }, [slug, router]);

  // Auto-scroll slider gợi ý
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || suggestProducts.length === 0) return;

    intervalRef.current = window.setInterval(() => {
      if (
        scrollContainer.scrollLeft >=
        scrollContainer.scrollWidth - scrollContainer.clientWidth
      ) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1; // tốc độ scroll
      }
    }, 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [suggestProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-lg">Sản phẩm không tồn tại</p>
      </div>
    );
  }

  const handleAddToCart = (buyNow = false) => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = cart.find((item: any) => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    if (buyNow) {
      router.push(`/cart?product=${product.id}`);
    } else {
      alert(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <HeroBanner />

      <main className="max-w-screen-lg mx-auto px-4 py-10 flex-1">
        {/* Chi tiết sản phẩm */}
        <div className="flex flex-col md:flex-row gap-10 bg-white shadow-md rounded-xl p-6">
          <div className="w-full md:w-1/2 aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e: any) => (e.currentTarget.src = "/logo/banner.jpg")}
              unoptimized
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-5">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-orange-600">
                {Number(product.price).toLocaleString()}đ
              </span>
              {product.original_price && (
                <span className="text-gray-400 line-through text-lg">
                  {Number(product.original_price).toLocaleString()}đ
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {product.is_new === 1 && (
                <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                  MỚI
                </span>
              )}
              {product.is_hot === 1 && (
                <span className="inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                  HOT
                </span>
              )}
            </div>

            <div
              className="mt-4 text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  product.description || "<p>Chưa có mô tả cho sản phẩm này.</p>",
              }}
            ></div>

            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium text-gray-800">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => handleAddToCart(false)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
              >
                🛒 Thêm vào giỏ hàng
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
              >
                💳 Mua ngay
              </button>

              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                onClick={() => router.push("/")}
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Sản phẩm gợi ý Slider */}
        {suggestProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm gợi ý</h2>

            <div className="relative">
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide"
                onMouseEnter={() => intervalRef.current && clearInterval(intervalRef.current)}
                onMouseLeave={() => {
                  const scrollContainer = scrollRef.current;
                  if (!scrollContainer) return;
                  intervalRef.current = window.setInterval(() => {
                    if (
                      scrollContainer.scrollLeft >=
                      scrollContainer.scrollWidth - scrollContainer.clientWidth
                    ) {
                      scrollContainer.scrollLeft = 0;
                    } else {
                      scrollContainer.scrollLeft += 1;
                    }
                  }, 20);
                }}
              >
                {suggestProducts.map((p) => (
                  <div key={p.id} className="min-w-[200px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollLeft -= 200;
                }}
                className="absolute top-1/2 left-0 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollLeft += 200;
                }}
                className="absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
