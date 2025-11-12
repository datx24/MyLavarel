"use client";

import Image from "next/image";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "MIẾNG DÁN", slug: "mieng-dan" },
    { name: "PHỤ KIỆN", slug: "phu-kien" },
    { name: "ÂM THANH", slug: "am-thanh" },
    { name: "ĐỒ CHƠI", slug: "do-choi" },
    { name: "VĂN PHÒNG", slug: "van-phong" },
    { name: "ĐIỆN MÁY", slug: "dien-may" },
  ];

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/products/search", { params: { q: searchQuery } });
        setSearchResults(res.data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#202121] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => router.push("/")} className="p-0">
              <Image
                src="https://admin.dekeyvietnam.com/storage/2019/08/logo.svg"
                alt="DEKEY"
                width={300}
                height={45}
                priority
                className="brightness-0 invert"
              />
            </button>

            <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-300">
              {categories.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => router.push(`/categories/${item.slug}`)}
                  className="hover:text-orange-500 transition"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div ref={searchRef} className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-400 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-500 rounded transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 rounded mt-1 z-50 max-h-72 overflow-y-auto">
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/logo/banner.jpg";
                        }}
                      />
                      <div className="flex flex-col text-xs overflow-hidden">
                        <span className="font-medium text-black truncate">{p.name}</span>
                        <span className="text-orange-500">
                          {Number(p.price).toLocaleString()}đ
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="relative p-2 hover:bg-gray-800 rounded-full transition"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="lg:hidden">
              <Menu className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
