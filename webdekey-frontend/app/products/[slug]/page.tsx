"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Minus,
  Plus,
  Heart
} from "lucide-react";
import api from "@/utils/api";
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import Footer from "@/components/user/Footer";

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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [suggestProducts, setSuggestProducts] = useState<Product[]>([]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        setWishlist(new Set(JSON.parse(saved)));
      }
    }
  }, []);

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
        const res = await api.get(`/products/slug/${slug}`);
        setProduct(res.data);

        if (res.data.category_id) {
          const catRes = await api.get(`/categories/${res.data.category_id}`);
          const categorySlug: string = catRes.data.slug;

          const suggestRes = await api.get(`/products/category/${categorySlug}`);
          setSuggestProducts(
            suggestRes.data.products.filter((p: Product) => p.id !== res.data.id)
          );
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndSuggest();
  }, [slug, router]);

  // Auto scroll qua lại
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || suggestProducts.length === 0) return;

    const scrollStep = () => {
      if (!scrollContainer) return;

      if (
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth
      ) {
        directionRef.current = -1;
      } else if (scrollContainer.scrollLeft <= 0) {
        directionRef.current = 1;
      }

      scrollContainer.scrollLeft += directionRef.current * 1.5;
    };

    intervalRef.current = window.setInterval(scrollStep, 20);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [suggestProducts]);

  const handleAddToCart = (buyNow = false) => {
    if (!product || typeof window === 'undefined') return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.product_id === product.id);

    if (existingItem) existingItem.quantity += quantity;
    else
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    if (buyNow) router.push(`/cart?product=${product.id}`);
    else alert(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const toggleWishlist = (productId: number) => {
    if (typeof window === 'undefined') return;
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(Array.from(newWishlist)));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-3 text-gray-600 font-medium">Đang tải sản phẩm...</p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600 text-lg font-medium">Sản phẩm không tồn tại</p>
      </div>
    );

  // Hàm decode HTML entity
  const decodeHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // Hàm xử lý URL cho ảnh trong HTML description
  const processDescriptionHtml = (html: string) => {
    if (!html) return html;
    
    // Decode entities trước
    let processed = decodeHtml(html);
    
    // Thay thế src của <img> tags: nếu không phải http, prefix với base URL
    processed = processed.replace(
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      (match, src) => {
        const imgUrl = getImageUrl(src);
        return match.replace(src, imgUrl);
      }
    );
    
    return processed;
  };

  // Clean text cho preview (chỉ text)
  const cleanDescription = product.description
    ? decodeHtml(product.description.replace(/<[^>]*>/g, "").trim())
    : "";
  const previewDesc =
    showFullDesc || cleanDescription.length <= 120
      ? cleanDescription
      : cleanDescription.slice(0, 120) + "...";

  // Full HTML cho mô tả đầy đủ
  const fullDescriptionHtml = product.description
    ? processDescriptionHtml(product.description)
    : "";

  return (
    <div className="bg-[#f1f1f1] min-h-screen flex flex-col">
      <Header />
      <HeroBanner />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {/* Chi tiết sản phẩm */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e: any) => (e.currentTarget.src = "/logo/banner.jpg")}
                unoptimized
              />
            </div>
            {/* Quick Wishlist Toggle */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${wishlist.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
                  }`}
              />
            </button>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-orange-600">
                    {Number(product.price).toLocaleString()}đ
                  </span>
                  {product.original_price && (
                    <span className="text-gray-400 line-through text-xl">
                      {Number(product.original_price).toLocaleString()}đ
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {product.is_new === 1 && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-4 py-2 rounded-full font-medium shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    MỚI
                  </span>
                )}
                {product.is_hot === 1 && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-4 py-2 rounded-full font-medium shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    HOT
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <span className="font-semibold text-gray-700 text-lg">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 text-lg font-medium bg-white border-x border-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => handleAddToCart(false)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <CreditCard className="w-5 h-5" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 shadow-sm mb-12">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              Mô tả sản phẩm
            </h2>
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base space-y-3">
              {showFullDesc ? (
                // Render full HTML khi mở rộng
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: fullDescriptionHtml }}
                />
              ) : (
                // Preview text thuần
                <p className="whitespace-pre-wrap">{previewDesc}</p>
              )}
              {cleanDescription.length > 120 && (
                <button
                  className="text-blue-600 font-medium hover:underline flex items-center gap-1 transition-colors duration-200 text-sm"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? "Thu gọn" : "Xem thêm"}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${showFullDesc ? "rotate-90" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Suggested Products Slider */}
        {suggestProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Sản phẩm gợi ý
            </h2>

            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4"
                onMouseEnter={() => intervalRef.current && clearInterval(intervalRef.current)}
                onMouseLeave={() => {
                  const scrollContainer = scrollRef.current;
                  if (!scrollContainer) return;
                  intervalRef.current = window.setInterval(() => {
                    if (!scrollContainer) return;
                    if (
                      scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                      scrollContainer.scrollWidth
                    )
                      directionRef.current = -1;
                    else if (scrollContainer.scrollLeft <= 0)
                      directionRef.current = 1;

                    scrollContainer.scrollLeft += directionRef.current * 1.5;
                  }, 20);
                }}
              >
                {suggestProducts.map((p) => (
                  <div
                    key={p.id}
                    className="min-w-[220px] flex-shrink-0 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => {
                      // Khi click vào card, load lại ProductDetailPage với slug mới
                      router.push(`/products/${p.slug}`);
                      // Scroll lên đầu trang
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                      <Image
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                        unoptimized
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click vào button wishlist ảnh hưởng tới card click
                          toggleWishlist(p.id);
                        }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors duration-200 ${wishlist.has(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
                            }`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-orange-600 font-bold text-base mb-1">
                        {Number(p.price).toLocaleString()}đ
                      </p>
                      {p.original_price && (
                        <p className="text-gray-400 text-xs line-through">
                          {Number(p.original_price).toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  </div>
                ))}

              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollLeft -= 300;
                }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg p-2 opacity-60 group-hover:opacity-100 transition-all duration-200 z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollLeft += 300;
                }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg p-2 opacity-60 group-hover:opacity-100 transition-all duration-200 z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}