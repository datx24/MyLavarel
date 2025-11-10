"use client";
import api from "@/utils/api";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách categories từ API
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Thêm category mới
  const addCategory = async () => {
    if (!name.trim() || !description.trim()) {
      return alert("Nhập đầy đủ tên và mô tả danh mục!");
    }
    setLoading(true);
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa category
  const deleteCategory = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-black">Quản lý danh mục</h1>

      {/* Form thêm danh mục */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded flex-1 text-black"
          placeholder="Tên danh mục..."
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded flex-1 text-black"
          placeholder="Mô tả danh mục..."
        />
        <button
          onClick={addCategory}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Đang thêm..." : "Thêm"}
        </button>
      </div>

      {/* Bảng hiển thị danh mục */}
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="border p-2 w-16 text-center">ID</th>
            <th className="border p-2 text-left">Tên danh mục</th>
            <th className="border p-2 text-left">Mô tả</th>
            <th className="border p-2 w-32 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center text-black">{c.id}</td>
              <td className="border p-2 text-black">{c.name}</td>
              <td className="border p-2 text-black">{c.description}</td>
              <td className="border border-black p-2 text-center">
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-black">
                Chưa có danh mục nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
