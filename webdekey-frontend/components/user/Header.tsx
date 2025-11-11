// components/Header.tsx
import Image from "next/image";
import { ShoppingCart, Search, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#202121] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Image
              src="https://admin.dekeyvietnam.com/storage/2019/08/logo.svg"
              alt="DEKEY"
              width={300}
              height={45}
              priority
              className="brightness-0 invert"
            />
            <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-300">
              {["MIẾNG DÁN", "PHỤ KIỆN", "ÂM THANH", "BỘ SƯU TẬP", "VĂN PHÒNG", "ĐÈN MÁY", "GIA DỤNG", "TIN TỨC"].map((item) => (
                <a key={item} href="#" className="hover:text-orange-500 transition">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-64 pl-10 pr-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <button className="relative p-2 hover:bg-gray-800 rounded-full transition">
              <ShoppingCart className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
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