"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [ordersOpen, setOrdersOpen] = useState(true);

  // Định nghĩa type rõ ràng, href bắt buộc có (trừ Orders parent)
  type MenuItem = {
    label: string;
    href: string;
    icon?: React.ComponentType<any>;
  };

  type OrdersGroup = {
    label: "Orders";
    icon: React.ComponentType<any>;
    subItems: MenuItem[];
  };

  type SidebarItem = MenuItem | OrdersGroup;

  const menuItems: SidebarItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Products", href: "/admin/products", icon: Package },
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isOrdersSection = pathname.startsWith("/admin/orders");

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col border-r border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WebDekey Admin
          </h2>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // XỬ LÝ RIÊNG CHO ORDERS GROUP
          if ("subItems" in item) {
            const activeSub = item.subItems.find(sub => isActive(sub.href));
            const parentOnlyActive = isOrdersSection && !activeSub;

            return (
              <div key="orders-group" className="space-y-1">
                {/* Parent Button */}
                <button
                  onClick={() => setOrdersOpen(!ordersOpen)}
                  className={`w-full group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    parentOnlyActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30"
                      : isOrdersSection
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {(parentOnlyActive || activeSub) && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full" />
                    )}
                    <ShoppingCart className={`w-6 h-6 ${parentOnlyActive || activeSub ? "text-white" : "group-hover:text-purple-400"}`} />
                    <span className="font-medium">Orders</span>
                  </div>
                  {ordersOpen ? (
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOrdersSection ? "text-white" : ""}`} />
                  ) : (
                    <ChevronRight className={`w-5 h-5 transition-transform ${isOrdersSection ? "text-white" : ""}`} />
                  )}
                </button>

                {/* Submenu */}
                {ordersOpen && (
                  <div className="ml-10 space-y-1 mt-1">
                    {item.subItems.map((sub) => {
                      const subActive = isActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href} // href luôn là string → TypeScript vui
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            subActive
                              ? "bg-white/20 text-white font-semibold shadow-lg"
                              : "text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${subActive ? "bg-pink-400" : "bg-gray-500"}`} />
                          <span className="text-sm">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if ("href" in item) {
            return (
              <Link
                key={item.href}
                href={item.href} 
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full" />
                )}
                {item.icon && <item.icon className={`w-6 h-6 ${isActive(item.href) ? "text-white" : "group-hover:text-purple-400"}`} />}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          }

          return null;
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold shadow-xl transition-all">
          <LogOut className="w-6 h-6" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <style jsx>{`
        aside::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </aside>
  );
}