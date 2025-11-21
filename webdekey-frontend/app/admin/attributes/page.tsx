"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Loader2,
  Trash2,
  Edit3,
  ChevronDown,
  Plus,
  X,
  Save,
  Search,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";

interface Category { id: number; name: string; }
interface Attribute {
  id: number;
  category_id: number;
  name: string;
  unit: string | null;
  category: Category;
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [visibleCount, setVisibleCount] = useState<{ [key: string]: number }>({});
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    unit: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttributes = async () => {
    setFetching(true);
    try {
      const [attrRes, catRes] = await Promise.all([
        api.get("/admin/attributes"),
        api.get("/categories")
      ]);
      setAttributes(attrRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchAttributes(); }, []);

  // Group & filter logic giữ nguyên
  const grouped: { [key: string]: Attribute[] } = {};
  attributes.forEach((attr) => {
    const catName = attr.category?.name ?? `Danh mục #${attr.category_id}`;
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(attr);
  });

  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped).filter(([catName, attrs]) =>
      catName.toLowerCase().includes(search.toLowerCase()) ||
      attrs.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const toggleCategory = (catName: string) => {
    setOpenCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const showMore = (catName: string) => {
    setVisibleCount(prev => ({ ...prev, [catName]: (prev[catName] || 20) + 20 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông số này?")) return;
    try {
      await api.delete(`/admin/attributes/${id}`);
      toast.success("Đã xóa thành công!");
      setAttributes(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ category_id: "", name: "", unit: "" });
    setOpenModal(true);
  };

  const openEdit = (attr: Attribute) => {
    setEditingId(attr.id);
    setForm({
      category_id: String(attr.category_id),
      name: attr.name,
      unit: attr.unit ?? "",
    });
    setOpenModal(true);
  };

  const submitForm = async () => {
    if (!form.category_id) return toast.error("Vui lòng chọn danh mục");
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên thông số");

    setSubmitting(true);
    const payload = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      unit: form.unit.trim() || null,
    };

    try {
      if (editingId) {
        await api.put(`/admin/attributes/${editingId}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/admin/attributes", payload);
        toast.success("Thêm mới thành công!");
      }
      setOpenModal(false);
      await fetchAttributes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto p-6 space-y-8">

          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Package className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý Thông số Kỹ thuật</h1>
                  <p className="text-gray-600 mt-1">Thiết lập thuộc tính cho từng danh mục sản phẩm</p>
                </div>
              </div>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Thêm thông số mới
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm danh mục hoặc thông số..."
              className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-md focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Loading */}
          {fetching && (
            <div className="flex flex-col items-center justify-center py-32 bg-white/70 backdrop-blur rounded-3xl">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-700 font-medium">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Empty */}
          {!fetching && Object.keys(filteredGrouped).length === 0 && (
            <div className="text-center py-32 bg-white/70 backdrop-blur rounded-3xl">
              <FolderOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {search ? "Không tìm thấy kết quả" : "Chưa có thông số kỹ thuật"}
              </h3>
              <p className="text-gray-600 mb-6">
                {search ? `"${search}" không khớp với thông số nào` : "Bắt đầu bằng cách thêm thông số đầu tiên"}
              </p>
              {!search && (
                <button onClick={openCreate} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow hover:shadow-lg transition">
                  <Plus className="w-5 h-5 inline mr-2" /> Thêm thông số đầu tiên
                </button>
              )}
            </div>
          )}

          {/* Danh sách */}
          {!fetching && Object.keys(filteredGrouped).length > 0 && (
            <div className="space-y-8">
              {Object.entries(filteredGrouped).map(([catName, attrs]) => {
                const isOpen = openCategories[catName] ?? true;
                const visibleAttrs = attrs.slice(0, visibleCount[catName] || 20);

                return (
                  <div key={catName} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(catName)}
                      className="w-full px-7 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-lg flex justify-between items-center hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <FolderOpen className="w-6 h-6" />
                        <span>{catName}</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-sm">
                          {attrs.length} thông số
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Attributes */}
                    {isOpen && (
                      <div className="p-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                          {visibleAttrs.map((attr) => (
                            <div
                              key={attr.id}
                              className="group relative bg-white rounded-2xl shadow hover:shadow-xl border border-gray-100 hover:border-indigo-300 transition-all duration-300 p-5"
                            >
                              <h3 className="font-semibold text-gray-900 truncate pr-8">
                                {attr.name}
                              </h3>
                              {attr.unit && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                  <AlertCircle className="w-4 h-4 text-indigo-500" />
                                  <span>{attr.unit}</span>
                                </div>
                              )}

                              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                  onClick={() => openEdit(attr)}
                                  className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition"
                                >
                                  <Edit3 className="w-4 h-4 text-indigo-700" />
                                </button>
                                <button
                                  onClick={() => handleDelete(attr.id)}
                                  className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {attrs.length > visibleAttrs.length && (
                            <button
                              onClick={() => showMore(catName)}
                              className="col-span-full text-center py-4 text-indigo-600 font-medium hover:text-indigo-800 transition"
                            >
                              Xem thêm {attrs.length - visibleAttrs.length} thông số...
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal - gọn gàng hơn */}
        {openModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingId ? "Chỉnh sửa thông số" : "Thêm thông số mới"}
                  </h2>
                  <button onClick={() => setOpenModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Danh mục</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition text-gray-900"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Tên thông số</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Màn hình, RAM, CPU..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition text-gray-900"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Đơn vị (tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: inch, GB, GHz..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition text-gray-900"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setOpenModal(false)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitForm}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 transition hover:shadow-lg"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingId ? "Lưu thay đổi" : "Thêm mới"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}