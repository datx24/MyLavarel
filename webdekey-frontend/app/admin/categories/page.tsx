"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, Save, Loader2, Package } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh mục");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openForm = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({ name: cat.name, description: cat.description });
    } else {
      setEditingId(null);
      setForm({ name: "", description: "" });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({ name: "", description: "" });
  };

  const saveCategory = async () => {
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên danh mục!");
    if (!form.description.trim()) return toast.error("Vui lòng nhập mô tả!");

    setLoading(true);
    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("description", form.description.trim());
    if (editingId) data.append("_method", "PUT");

    try {
      if (editingId) {
        await api.post(`/categories/${editingId}`, data);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/categories", data);
        toast.success("Thêm danh mục thành công!");
      }
      await fetchCategories();
      closeForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?\nCảnh báo: Tất cả sản phẩm trong danh mục này sẽ bị ảnh hưởng!`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Xóa thành công!");
      await fetchCategories();
    } catch (err) {
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-9 h-9 text-indigo-600" />
                  Quản lý danh mục
                </h1>
                <p className="text-gray-600 mt-2">
                  Tổng cộng: <span className="font-bold text-indigo-600">{categories.length}</span> danh mục
                </p>
              </div>
              <button
                onClick={() => openForm()}
                className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Thêm danh mục
              </button>
            </div>
          </div>

          {/* Danh sách danh mục - Grid giống Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-16 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Đang tải danh mục...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Chưa có danh mục nào</p>
                <p className="text-gray-500 text-sm mt-2">Hãy thêm danh mục đầu tiên!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
                  >
                    <div className="p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Package className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{cat.name}</h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{cat.description}</p>
                    </div>

                    {/* Nút thao tác - hiện khi hover */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openForm(cat)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Form - giống hệt Products */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Điện thoại, Laptop..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả danh mục
                  </label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về danh mục này..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-black font-medium resize-none"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4">
                <button
                  onClick={closeForm}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={saveCategory}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 transition-all shadow-lg transform hover:scale-105"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {loading ? "Đang lưu..." : "Lưu danh mục"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}