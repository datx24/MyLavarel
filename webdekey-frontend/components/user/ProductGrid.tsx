// components/user/ProductGrid.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Sparkles, Flame } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  image?: string;
  is_new?: number | boolean;
  is_hot?: number | boolean;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");

        const allProducts = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        // Lấy sản phẩm nổi bật + giới hạn tối đa 10
        const featuredProducts = allProducts
          .filter((p: Product) => p.is_new === true || p.is_hot === true)
          .slice(0, 10);

        setProducts(featuredProducts);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-5 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="text-gray-400 mb-4">
          <Sparkles className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-lg text-gray-600">Chưa có sản phẩm nổi bật nào!</p>
        <p className="text-sm text-gray-500 mt-2">
          Hãy thêm sản phẩm MỚI hoặc HOT trong admin nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Tiêu đề nổi bật */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          Sản Phẩm Nổi Bật
          <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
        </h2>
        <p className="text-gray-600 mt-2">Những món hàng đang HOT nhất hôm nay!</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
