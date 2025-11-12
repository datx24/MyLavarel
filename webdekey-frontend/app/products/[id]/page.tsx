"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import HeroBanner from "@/components/user/HeroBanner";

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

interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product) return;

    // Lấy giỏ hàng hiện tại từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItem = cart.find((item: CartItem) => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        product_id: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    // Lưu lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    // Logic để mua ngay - chuyển đến trang thanh toán
    router.push(`/cart?product=${id}`);
  };

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
      <HeroBanner />
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
                    {Number(product.price).toLocaleString()}đ
                  </span>
                  {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">
                      {Number(product.original_price).toLocaleString()}đ
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Số lượng: {product.stock}
                  </span>
                </div>
                <div className="mb-6 flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg"
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg"
                  >
                    Mua ngay
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
