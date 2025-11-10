"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Database, LogOut, Settings } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-lg">
      {/* Logout */}
      <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all">
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
}
