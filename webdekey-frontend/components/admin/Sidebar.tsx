"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const path = usePathname();

  const menu = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Products", href: "/admin/products" },
    { label: "Users", href: "/admin/users" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      {menu.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className={`p-2 rounded hover:bg-gray-700 ${
            path === m.href ? "bg-gray-800" : ""
          }`}
        >
          {m.label}
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
