"use client";

import React from "react";
import {
  Package, Edit3, Trash2, Sparkles, Flame, Percent, Box,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Attribute {
  id: number;
  name: string;
  type: string;
}

interface AttributeValue {
  id?: number;
  attribute_id: number;
  name?: string;
  value: string;
  attribute?: Attribute;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  stock: number;
  image?: string | null;
  sub_images?: string[];
  category_id: number;
  is_new?: boolean | number;
  is_hot?: boolean | number;
  category?: Category | null;
  attributes?: AttributeValue[] | null;
}

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN", { 
    style: "currency", 
    currency: "VND", 
    minimumFractionDigits: 0 
  }).format(n);

  const calculateDiscount = (orig: number | null | undefined, sale: number) => 
    orig && orig > sale ? Math.round(((orig - sale) / orig) * 100) : null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Hàm kiểm tra có nên hiển thị badge không
  const shouldShowBadge = (value: boolean | number | undefined): boolean => {
    return value === true || value === 1;
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-20 text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 font-medium">
            Chưa có sản phẩm
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {products.map(p => {
          const discount = calculateDiscount(p.original_price || null, p.price);
          return (
            <div 
              key={p.id} 
              className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {p.image ? (
                  <img 
                    src={`http://127.0.0.1:8000/storage/${p.image}`} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-300" />
                  </div>
                )}
                {discount && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
                    <Percent className="w-4 h-4" />-{discount}%
                  </div>
                )}
                
                {/* CHỈ HIỂN THỊ KHI CÓ GIÁ TRỊ TRUE hoặc 1 */}
                {(shouldShowBadge(p.is_new) || shouldShowBadge(p.is_hot)) && (
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {shouldShowBadge(p.is_new) && (
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />Mới
                      </span>
                    )}
                    {shouldShowBadge(p.is_hot) && (
                      <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />Hot
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{p.name}</h3>
                <div className="mt-4">
                  <p className="text-2xl font-extrabold text-emerald-600">{formatVND(p.price)}</p>
                  {p.original_price && p.original_price > p.price && (
                    <p className="text-sm text-gray-500 line-through mt-1">
                      {formatVND(p.original_price)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-3">
                  <Box className="w-4 h-4" />
                  <span>{p.stock} cái</span>
                </div>

                {/* SUB IMAGES PREVIEW ON CARD */}
                {p.sub_images && p.sub_images.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    {p.sub_images.slice(0, 4).map((si, idx) => (
                      <img 
                        key={idx} 
                        src={`http://127.0.0.1:8000/storage/${si}`} 
                        alt={`sub-${idx}`} 
                        className="w-10 h-10 object-cover rounded-md border" 
                      />
                    ))}
                    {p.sub_images.length > 4 && (
                      <span className="text-xs text-gray-400">+{p.sub_images.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(p)} 
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-indigo-100"
                >
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                </button>
                <button 
                  onClick={() => onDelete(p.id)} 
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Trang <span className="font-bold text-indigo-600">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(1)} 
                disabled={currentPage === 1} 
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let page = currentPage <= 4 ? i + 1 : currentPage - 3 + i;
                if (page > totalPages) return null;
                return (
                  <button 
                    key={page} 
                    onClick={() => goToPage(page)} 
                    className={`w-10 h-10 rounded-lg font-medium ${
                      currentPage === page 
                        ? "bg-indigo-600 text-white shadow-lg scale-110" 
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                );
              }).filter(Boolean)}
              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => goToPage(totalPages)} 
                disabled={currentPage === totalPages} 
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;