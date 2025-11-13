// components/user/ProductGridByCategory.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  image?: string;
  is_new?: number | boolean;
  is_hot?: number | boolean;
  category_id: number;
}

export default function ProductGridByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<number, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get("/categories");
        const prodRes = await api.get("/products");

        // SỬA 2 DÒNG NÀY – QUAN TRỌNG NHẤT!
        const cats: Category[] = Array.isArray(catRes.data) 
          ? catRes.data 
          : catRes.data.data || [];

        const allProducts: Product[] = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data.data || [];

        const grouped: Record<number, Product[]> = {};
        cats.forEach((cat) => {
          const filtered = allProducts
            .filter((p) => p.category_id === cat.id)
            .slice(0, 5);
          if (filtered.length > 0) {
            grouped[cat.id] = filtered;
          }
        });

        setCategories(cats);
        setProductsByCat(grouped);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16">
      {categories.map((category) => {
        const products = productsByCat[category.id];
        if (!products || products.length === 0) return null;

        return (
          <section key={category.id} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {/* Tiêu đề + Xem thêm */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {category.name}
              </h2>
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                Xem thêm
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Grid sản phẩm */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}