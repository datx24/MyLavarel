"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/api";

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
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/slug/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Không tìm thấy sản phẩm:", err);
        router.push("/"); // quay về trang chủ nếu không có sản phẩm
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="p-10 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Sản phẩm không tồn tại</div>;
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh */}
        <div className="w-full md:w-1/2 aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Không có ảnh
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-orange-500">
              {Number(product.price).toLocaleString()}đ
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">
                {Number(product.original_price).toLocaleString()}đ
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {product.is_new === 1 && (
              <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
                MỚI
              </span>
            )}
            {product.is_hot === 1 && (
              <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded">
                HOT
              </span>
            )}
          </div>

          <div className="mt-4 text-gray-700 whitespace-pre-wrap">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </div>
        </div>
      </div>
    </div>
  );
}
