// components/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  original_price?: string | number | null;
  image?: string; 
  is_new?: number | boolean;
  is_hot?: number | boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = `http://127.0.0.1:8000/storage/${product.image}`;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = "/logo/banner.jpg";
            }}
          />
          {product.is_new === true && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">MỚI</span>
          )}
          {product.is_hot === true && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">HOT</span>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-11">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-base font-bold text-orange-500">
              {Number(product.price).toLocaleString()}đ
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">
                {Number(product.original_price).toLocaleString()}đ
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}