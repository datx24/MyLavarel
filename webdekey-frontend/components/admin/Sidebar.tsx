"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// === TypeScript Types ===
type MenuItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
};

type MenuGroup = {
  label: string;
  icon: React.ComponentType<any>;
  subItems: MenuItem[];
};

type SidebarItem = MenuItem | MenuGroup;

export default function Sidebar() {
  const pathname = usePathname();

  // Mở rộng nhóm mặc định (có thể tùy chỉnh)
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    Products: true,
    Orders: true,
  });

  const menuItems: SidebarItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    {
      label: "Products",
      icon: Package,
      subItems: [
        { label: "Danh sách sản phẩm", href: "/admin/products" },
        { label: "Thông số kỹ thuật", href: "/admin/attributes" },
      ],
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      subItems: [
        { label: "Tất cả đơn hàng", href: "/admin/orders" },
        { label: "Thống kê đơn hàng", href: "/admin/orders/statistics" },
      ],
    },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Kiểm tra active chính xác (dùng cho single item và subitem)
  const isExactActive = (href: string): boolean => pathname === href;

  // Kiểm tra nhóm có active không (dùng để highlight nhóm khi đang ở sub-page)
  const isGroupActive = (subItems: MenuItem[]): boolean => {
    return subItems.some((sub) => pathname.startsWith(sub.href + "/") || pathname === sub.href);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col border-r border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dekey Admin
          </h2>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // === Nhóm có subItems ===
          if ("subItems" in item) {
            const groupActive = isGroupActive(item.subItems);
            const isOpen = openGroups[item.label] ?? false;

            return (
              <div key={item.label} className="space-y-1">
                {/* Nút mở/đóng nhóm */}
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    groupActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  ) : (
                    <ChevronRight className="w-5 h-5 transition-transform" />
                  )}
                </button>

                {/* Danh sách subitems */}
                {isOpen && (
                  <div className="ml-10 space-y-1 mt-1">
                    {item.subItems.map((sub) => {
                      const active = isExactActive(sub.href);

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            active
                              ? "bg-white/20 text-white font-semibold shadow-lg"
                              : "text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              active ? "bg-pink-400" : "bg-gray-500"
                            }`}
                          />
                          <span className="text-sm">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // === Item đơn lẻ ===
          const active = isExactActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full" />
              )}
              {item.icon && <item.icon className="w-6 h-6" />}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-xl transition-all duration-300">
          <LogOut className="w-6 h-6" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}