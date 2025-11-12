"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Package, Plus, Edit3, Trash2, Image as ImageIcon,
  Sparkles, Flame, X, Save, Loader2, Tag, DollarSign, Box,
  Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category_id: number;
  is_new?: boolean;
  is_hot?: boolean;
}

interface Category {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 4;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Bộ lọc & tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    image: null as File | null,
    is_new: false,
    is_hot: false,
  });

  // SỬA ĐÚNG 100%: useEditor gọi trực tiếp, không trong useEffect
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-black",
      },
    },
  });

  // Cleanup editor khi component unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset trang khi lọc/tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const openForm = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        category_id: String(product.category_id),
        image: null,
        is_new: product.is_new || false,
        is_hot: product.is_hot || false,
      });
      editor?.commands.setContent(product.description || "");
      setImagePreview(product.image ? `http://127.0.0.1:8000/storage/${product.image}` : null);
    } else {
      setEditingProductId(null);
      setForm({
        name: "",
        price: "",
        stock: "",
        category_id: "",
        image: null,
        is_new: false,
        is_hot: false,
      });
      editor?.commands.setContent("");
      setImagePreview(null);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setImagePreview(null);
    editor?.commands.clearContent();
  };

  const saveProduct = async () => {
    if (!form.name.trim()) return alert("Vui lòng nhập tên sản phẩm!");
    if (!form.price.trim()) return alert("Vui lòng nhập giá bán!");
    if (!form.stock.trim()) return alert("Vui lòng nhập số lượng!");
    if (!form.category_id) return alert("Vui lòng chọn danh mục!");

    setLoading(true);
    const data = new FormData();
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("category_id", form.category_id);
    data.append("description", editor?.getHTML() || "");
    data.append("is_new", form.is_new ? "1" : "0");
    data.append("is_hot", form.is_hot ? "1" : "0");
    if (form.image) data.append("image", form.image);
    if (editingProductId) data.append("_method", "PUT");

    try {
      if (editingProductId) {
        await api.post(`/products/${editingProductId}`, data);
      } else {
        await api.post("/products", data);
      }
      await fetchProducts();
      closeForm();
      alert("Lưu sản phẩm thành công!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Lưu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Xóa sản phẩm này? Không thể hoàn tác!")) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Lọc + tìm kiếm
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || String(p.category_id) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading editor
  if (!editor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang khởi tạo trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-9 h-9 text-indigo-600" />
                Quản lý sản phẩm
              </h1>
              <p className="text-gray-600 mt-2">
                Hiển thị: <span className="font-bold text-indigo-600">{currentProducts.length}</span> / {filteredProducts.length} sản phẩm
              </p>
            </div>
            <button
              onClick={() => openForm()}
              className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black font-medium placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-black font-medium appearance-none cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid + Pagination */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {currentProducts.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {searchTerm || categoryFilter ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
                {currentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {p.image ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${p.image}`}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{p.name}</h3>
                      <div className="mt-3">
                        <p className="text-2xl font-extrabold text-emerald-600">
                          {formatVND(p.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Box className="w-4 h-4" />
                          <span>{p.stock} cái</span>
                        </div>

                        {/* CHỈ HIỆN KHI CÓ TAG */}
                        {(p.is_new || p.is_hot) && (
                          <div className="flex gap-2">
                            {p.is_new && (
                              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Mới
                              </span>
                            )}
                            {p.is_hot && (
                              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5" />
                                Hot
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openForm(p)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                      Trang <span className="font-bold text-indigo-600">{currentPage}</span> / {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? "bg-indigo-600 text-white shadow-lg scale-110"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Form - FULL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4" /> Tên sản phẩm
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nhập tên..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4" /> Giá bán
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-black font-medium"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Box className="w-4 h-4" /> Tồn kho
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black font-medium"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_new}
                      onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="flex items-center gap-2 font-medium text-black">
                      <Sparkles className="w-5 h-5 text-red-500" /> Mới
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_hot}
                      onChange={(e) => setForm({ ...form, is_hot: e.target.checked })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="flex items-center gap-2 font-medium text-black">
                      <Flame className="w-5 h-5 text-orange-500" /> Hot
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4" /> Hình ảnh
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg mx-auto" />
                      ) : (
                        <div>
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">Click hoặc kéo thả để tải ảnh</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                    <EditorContent editor={editor} />
                  </div>
                </div>
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
                onClick={saveProduct}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 transition-all shadow-lg transform hover:scale-105"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}