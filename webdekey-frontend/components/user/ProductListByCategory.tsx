"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/utils/api";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  image?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ProductListByCategory({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Bộ lọc giá
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedMin, setSelectedMin] = useState(0);
  const [selectedMax, setSelectedMax] = useState(0);
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(0);

  // Lấy khoảng giá từ backend
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await api.get(`/products/category/${slug}/price-range`);
        const min = Number(res.data.min_price);
        const max = Number(res.data.max_price);
        setMinPrice(min);
        setMaxPrice(max);
        setSelectedMin(min);
        setSelectedMax(max);
        setTempMin(min);
        setTempMax(max);
      } catch (err) {
        console.error("Lỗi lấy khoảng giá:", err);
      }
    };
    fetchPriceRange();
  }, [slug]);

  // Hàm fetch sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/category/${slug}`, {
        params: {
          page: currentPage,
          min_price: selectedMin,
          max_price: selectedMax,
        },
      });
      const data = res.data;
      setCategory(data.category);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Lỗi fetch sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, currentPage, selectedMin, selectedMax]);

  // Fetch khi đổi trang hoặc lần đầu
  useEffect(() => {
    if (maxPrice > 0) fetchProducts();
  }, [fetchProducts, maxPrice]);

  // Áp dụng filter: cập nhật giá và fetch ngay
  const handleApply = () => {
    const min = Number(tempMin);
    const max = Number(tempMax);
    setSelectedMin(min);
    setSelectedMax(max);
    setCurrentPage(1);
    fetchProducts();
  };

  if (loading) return <ProductSkeleton />;

  if (!category) return <div className="text-center py-20 text-gray-500">Danh mục không tồn tại</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-600 mt-2">{pagination?.total || 0} sản phẩm</p>
        </div>

        {/* Bộ lọc giá */}
        {maxPrice > 0 && (
          <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Lọc theo giá</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <span>Từ:</span>
                  <input
                    type="number"
                    value={tempMin}
                    min={minPrice}
                    max={tempMax - 10000}
                    onChange={(e) => setTempMin(Math.min(Number(e.target.value), tempMax - 10000))}
                    className="w-28 border rounded-md px-2 py-1"
                  />
                  <span>₫</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Đến:</span>
                  <input
                    type="number"
                    value={tempMax}
                    min={tempMin + 10000}
                    max={maxPrice}
                    onChange={(e) => setTempMax(Math.max(Number(e.target.value), tempMin + 10000))}
                    className="w-28 border rounded-md px-2 py-1"
                  />
                  <span>₫</span>
                </div>
              </div>

              {/* Slider */}
              <div className="relative h-3 mt-4">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1 bg-blue-400 rounded-full"
                  style={{
                    left: `${((tempMin - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    width: `${((tempMax - tempMin) / (maxPrice - minPrice)) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={tempMin}
                  onChange={(e) => setTempMin(Math.min(Number(e.target.value), tempMax - 10000))}
                  className="absolute w-full h-3 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={tempMax}
                  onChange={(e) => setTempMax(Math.max(Number(e.target.value), tempMin + 10000))}
                  className="absolute w-full h-3 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-700 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Nút áp dụng */}
              <div className="flex justify-center mt-4 gap-4">
                <button
                  onClick={handleApply}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Áp dụng
                </button>
                <button
                  onClick={() => {
                    setTempMin(minPrice);
                    setTempMax(maxPrice);
                  }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách sản phẩm */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Không có sản phẩm nào trong tầm giá
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Phân trang */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft />
                </button>
                <span>
                  Trang {currentPage} / {pagination.last_page}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pagination.last_page, p + 1));
                  }}
                  disabled={currentPage === pagination.last_page}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-12 bg-gray-200 rounded w-64 mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
