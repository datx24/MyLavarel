"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  const addCategory = async () => {
    if (!name.trim()) return alert("Nhập tên danh mục!");
    setLoading(true);
    try {
      await api.post("/categories", { name });
      setName("");
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    await api.delete(`/categories/${id}`);
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý danh mục</h1>
      <div className="flex gap-3 mb-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
          placeholder="Tên danh mục..."
        />
        <button
          onClick={addCategory}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Đang thêm..." : "Thêm"}
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 w-16">ID</th>
            <th className="border p-2">Tên danh mục</th>
            <th className="border p-2 w-32">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="border p-2 text-center">{c.id}</td>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                Chưa có danh mục nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
