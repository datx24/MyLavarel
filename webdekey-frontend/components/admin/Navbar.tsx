"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Database, LogOut, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Categories", href: "/admin/categories", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-lg">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-wide text-blue-400">
        DEKEY Admin
      </div>

      {/* Menu */}
      <div className="flex space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all">
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
}
