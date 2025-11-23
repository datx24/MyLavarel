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
  Heart,
  Star,
  Shield,
  Truck,
  RotateCcw,
  ZoomIn
} from "lucide-react";
import api from "@/utils/api";
import Header from "@/components/user/Header";
import HeroBanner from "@/components/user/HeroBanner";
import Footer from "@/components/user/Footer";

interface ProductAttribute {
  id: number;
  value: string;
  attribute: {
    id: number;
    name: string;
    unit?: string | null;
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  original_price?: number | string | null;
  description?: string;
  image?: string;
  sub_images?: string[];
  is_new?: boolean | number;
  is_hot?: boolean | number;
  category_id?: number;
  attributes?: ProductAttribute[];
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const imageRef = useRef<HTMLDivElement>(null);

  // Load wishlist from localStorage
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
    return image.startsWith("http") ? image : `http://127.0.0.1:8000/storage/${image}`;
  };

  // Get all images including main image and sub images
  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.sub_images && product.sub_images.length > 0) {
      images.push(...product.sub_images);
    }
    return images;
  };

  const images = getAllImages();

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

  // Auto scroll suggested products
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || suggestProducts.length === 0) return;

    const scrollStep = () => {
      if (!scrollContainer) return;
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
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
    if (!product || typeof window === "undefined") return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productPrice = Number(product.price) || 0;
    const existingItem = cart.find((item: any) => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: productPrice,
        image: product.image,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    if (buyNow) {
      router.push("/cart");
    } else {
      // Show nice toast notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right duration-300';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span class="font-semibold">Đã thêm "${product.name}" vào giỏ hàng!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  };

  const toggleWishlist = (productId: number) => {
    if (typeof window === 'undefined') return;
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      // Show remove from wishlist notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right duration-300';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <Heart className="w-5 h-5" />
          <span class="font-semibold">Đã xóa khỏi yêu thích</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 2000);
    } else {
      newWishlist.add(productId);
      // Show add to wishlist notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-pink-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-right duration-300';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <Heart className="w-5 h-5 fill-white" />
          <span class="font-semibold">Đã thêm vào yêu thích</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 2000);
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(Array.from(newWishlist)));
  };

  // Image zoom effect
  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Đang tải sản phẩm...</p>
        <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 text-xl font-medium mb-2">Sản phẩm không tồn tại</p>
        <p className="text-gray-400 mb-6">Có vẻ như sản phẩm bạn tìm kiếm không còn khả dụng</p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );

  const decodeHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const processDescriptionHtml = (html: string) => {
    if (!html) return html;
    let processed = decodeHtml(html);
    processed = processed.replace(
      /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      (match, src) => match.replace(src, getImageUrl(src))
    );
    return processed;
  };

  const cleanDescription = product.description
    ? decodeHtml(product.description.replace(/<[^>]*>/g, "").trim())
    : "";
  const previewDesc = showFullDesc || cleanDescription.length <= 120
    ? cleanDescription
    : cleanDescription.slice(0, 120) + "...";
  const fullDescriptionHtml = product.description ? processDescriptionHtml(product.description) : "";

  // Calculate discount percentage
  const discountPercent = product.original_price
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white from-slate-50 to-blue-50/30">
      <Header />
      <HeroBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <button
            onClick={() => router.push("/")}
            className="hover:text-orange-500 transition-colors duration-200"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-orange-500 font-medium">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image with Zoom */}
            <div
              ref={imageRef}
              className="relative group aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-white cursor-zoom-in transition-transform duration-500"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => {
                if (imageRef.current) {
                  imageRef.current.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={() => {
                if (imageRef.current) {
                  imageRef.current.style.transform = 'scale(1)';
                }
              }}
            >
              <Image
                src={getImageUrl(images[selectedImageIndex])}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover transition-all duration-500"
                onLoad={() => setImageLoading(false)}
                onError={(e: any) => {
                  e.currentTarget.src = "/logo/banner.jpg";
                  setImageLoading(false);
                }}
                unoptimized
              />

              {/* Loading Skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
              )}

              {/* Image Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300">
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${wishlist.has(product.id)
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:text-pink-500 shadow-lg'
                      }`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-200 ${wishlist.has(product.id) ? 'fill-white' : ''
                        }`}
                    />
                  </button>

                  <button className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-500 shadow-lg transition-all duration-300 transform hover:scale-110">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      -{discountPercent}%
                    </span>
                  </div>
                )}

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-3 shadow-2xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-3 shadow-2xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageLoading(true);
                    }}
                    className={`flex-shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-110 ${selectedImageIndex === index
                      ? 'border-orange-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 shadow-md'
                      }`}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className={`absolute inset-0 transition-all duration-300 ${selectedImageIndex === index
                      ? 'bg-orange-500/10'
                      : 'bg-black/0 hover:bg-black/5'
                      }`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">(128 đánh giá)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-orange-600">
                    {Number(product.price).toLocaleString()}đ
                  </span>
                  {product.original_price && (
                    <span className="text-2xl text-gray-400 line-through">
                      {Number(product.original_price).toLocaleString()}đ
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                    <span>Tiết kiệm {discountPercent}%</span>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                {product.is_new === true && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    SẢN PHẨM MỚI
                  </span>
                )}
                {product.is_hot === true && (
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    SẢN PHẨM HOT
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
                <div className="flex items-center gap-3 text-gray-600 bg-blue-200 rounded-2xl p-4 backdrop-blur-sm">
                  <Truck className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold">Miễn phí vận chuyển</p>
                    <p className="text-sm">Cho đơn từ 500K</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-cyan-200 rounded-2xl p-4 backdrop-blur-sm">
                  <RotateCcw className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold">Đổi trả 7 ngày</p>
                    <p className="text-sm">Hoàn tiền 100%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-pink-200 rounded-2xl p-4 backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="font-semibold">Bảo hành 12 tháng</p>
                    <p className="text-sm">Chính hãng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 text-black">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 text-base">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-500 hover:text-orange-600 hover:bg-gray-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-base font-semibold bg-white border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-2 text-gray-500 hover:text-orange-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white/80 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tình trạng:</span>
                <span className="text-green-600 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Còn hàng
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Chỉ còn 12 sản phẩm - Đặt hàng ngay!</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => handleAddToCart(false)}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Thêm vào giỏ hàng</span>
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
              >
                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Mua ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description & Specs Tabs */}
        <div className="mb-16">
          {/* Tab Headers */}
          <div className="flex border-b-2 border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-8 py-4 font-semibold text-lg transition-all duration-300 border-b-4 ${activeTab === 'description'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Mô tả sản phẩm
            </button>
            {product.attributes && product.attributes.length > 0 && (
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-8 py-4 font-semibold text-lg transition-all duration-300 border-b-4 ${activeTab === 'specs'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Thông số kỹ thuật
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {activeTab === 'description' && product.description && (
              <div className="p-8">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {showFullDesc ? (
                    <div dangerouslySetInnerHTML={{ __html: fullDescriptionHtml }} />
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap text-lg leading-8">{previewDesc}</p>
                      {cleanDescription.length > 120 && (
                        <button
                          className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          onClick={() => setShowFullDesc(!showFullDesc)}
                        >
                          {showFullDesc ? "Thu gọn" : "Xem đầy đủ mô tả"}
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showFullDesc ? "rotate-90" : ""}`} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'specs' && product.attributes && product.attributes.length > 0 && (
              <div className="p-8">
                <div className="grid gap-6">
                  {product.attributes.map(attr => (
                    <div key={attr.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                      <span className="font-semibold text-gray-700 text-lg min-w-[200px]">
                        {attr.attribute?.name}
                      </span>
                      <span className="text-gray-600 text-lg text-right">
                        {attr.value}
                        {attr.attribute?.unit && (
                          <span className="text-gray-400 ml-1">{attr.attribute.unit}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Products */}
        {suggestProducts.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sản phẩm liên quan
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Khám phá thêm các sản phẩm cùng danh mục được nhiều người yêu thích
              </p>
            </div>

            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto scrollbar-none scroll-smooth pb-8 px-4"
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
                    className="min-w-[280px] flex-shrink-0 bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 cursor-pointer group/card"
                    onClick={() => {
                      router.push(`/products/${p.slug}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <Image
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                        unoptimized
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-2xl p-3 shadow-lg transition-all duration-300 transform hover:scale-110 opacity-0 group-hover/card:opacity-100"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors duration-200 ${wishlist.has(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
                            }`}
                        />
                      </button>

                      {/* Product badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {p.is_new === 1 && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            MỚI
                          </span>
                        )}
                        {p.is_hot === 1 && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            HOT
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-3 leading-tight text-lg group-hover/card:text-orange-600 transition-colors duration-200">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 font-bold text-xl mb-1">
                            {Number(p.price).toLocaleString()}đ
                          </p>
                          {p.original_price && (
                            <p className="text-gray-400 text-sm line-through">
                              {Number(p.original_price).toLocaleString()}đ
                            </p>
                          )}
                        </div>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= 400)}
                className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += 400)}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-2xl p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}