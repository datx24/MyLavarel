"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  image: string;
  category_id: number;
  is_new?: boolean;
  is_hot?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error || "Sản phẩm không tồn tại."}</div>
      </div>
    );
  }

  const imageUrl = `http://127.0.0.1:8000/storage/${product.image}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = "/banner/banner.jpg";
                    }}
                  />
                  {product.is_new && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                      MỚI
                    </span>
                  )}
                  {product.is_hot && (
                    <span className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                      HOT
                    </span>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-orange-600">
                    {product.price.toLocaleString()}đ
                  </span>
                  {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.original_price.toLocaleString()}đ
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Số lượng: {product.stock}
                  </span>
                </div>
                <div className="mb-6">
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg">
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
            <div
              className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
