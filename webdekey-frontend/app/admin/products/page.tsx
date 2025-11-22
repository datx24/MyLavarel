"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import {
  Package, Plus, Edit3, Trash2, Image as ImageIcon,
  Sparkles, Flame, X, Save, Loader2, Tag, DollarSign, Box,
  Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Percent, Settings, Trash
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import TiptapEditor from "@/components/admin/TiptapEditor";


/**
 * Version B - Admin Products Component (Full)
 * - Keeps UI identical to the user's original layout
 * - Adds full sub_images support (old + new)
 * - Preview sub_images on edit
 * - Add / remove sub images in the form
 * - Show sub images on product card (small thumbnails)
 * - Send correct FormData payload to backend:
 *     - old_sub_images[] (strings) for images to keep
 *     - sub_images[] (files) for newly uploaded files
 *
 * Notes:
 * - This file is intentionally verbose and contains helpful inline comments.
 * - Adjust API endpoints in `api` util if your base URL differs.
 */

/* ================================
   Types & Interfaces
   ================================ */
interface Attribute {
  id: number;
  name: string;
  type: string;
}

interface AttributePivot {
  product_id: number;
  attribute_id: number;
  value: string;
}

interface AttributeValue {
  id?: number;
  attribute_id: number;
  name?: string;
  value: string;
  attribute?: Attribute;
  pivot?: AttributePivot;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  stock: number;
  image?: string | null;
  sub_images?: string[]; // array of storage paths like "products/sub1.jpg"
  category_id: number;
  is_new?: boolean;
  is_hot?: boolean;
  category?: Category | null;
  attributes?: AttributeValue[] | null;
}

/* ================================
   Component
   ================================ */
const ITEMS_PER_PAGE = 4;

export default function ProductsPage() {
  // ====================
  // States
  // ====================
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form state contains:
  // - image: main image file
  // - sub_images: array of File for new uploads
  // - old_sub_images: array of string (paths) that will be kept
  // - attributes: dynamic list
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    stock: "",
    category_id: "",
    image: null as File | null,
    sub_images: [] as File[],
    old_sub_images: [] as string[], // holds storage paths when editing
    is_new: false,
    is_hot: false,
    attributes: [] as { attribute_id: string; value: string; attribute_name?: string }[],
  });

  // ====================
  // Fetching data
  // ====================
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // Normalize: ensure sub_images exists as array
      const normalized = list.map((p: any) => ({ ...p, sub_images: p.sub_images || [] }));
      setProducts(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải sản phẩm");
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(list);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh mục");
      setCategories([]);
    }
  };

  const fetchAllAttributes = async () => {
    try {
      const res = await api.get("/admin/attributes");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAllAttributes(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttributesByCategory = async (categoryId: string) => {
    if (!categoryId) {
      setCategoryAttributes([]);
      return;
    }
    try {
      const res = await api.get(`admin/attributes-by-category/${categoryId}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategoryAttributes(list);
    } catch (err) {
      console.error("Lỗi load attributes theo danh mục:", err);
      toast.error("Không tải được thông số kỹ thuật");
      setCategoryAttributes([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllAttributes();
  }, []);

  useEffect(() => {
    // Reset current page when filters change
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // ====================
  // Form helpers
  // ====================
  const openForm = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      const mappedAttributes = (product.attributes || []).map(a => ({
        attribute_id: String(a.attribute_id),
        attribute_name: a.attribute?.name || "",
        value: a.value || ""
      }));

      setForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price || ""),
        original_price: product.original_price ? String(product.original_price) : "",
        stock: String(product.stock || 0),
        category_id: String(product.category_id || ""),
        image: null,
        sub_images: [],
        old_sub_images: product.sub_images ? [...product.sub_images] : [],
        is_new: !!product.is_new,
        is_hot: !!product.is_hot,
        attributes: mappedAttributes
      });

      setImagePreview(product.image ? `http://127.0.0.1:8000/storage/${product.image}` : null);
      setSubImagePreviews((product.sub_images || []).map(img => `http://127.0.0.1:8000/storage/${img}`));
      loadAttributesByCategory(String(product.category_id || ""));
    } else {
      // New product
      setEditingProductId(null);
      setForm({
        name: "",
        description: "",
        price: "",
        original_price: "",
        stock: "",
        category_id: "",
        image: null,
        sub_images: [],
        old_sub_images: [],
        is_new: false,
        is_hot: false,
        attributes: []
      });
      setImagePreview(null);
      setSubImagePreviews([]);
      setCategoryAttributes([]);
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setImagePreview(null);
    setSubImagePreviews([]);
    setCategoryAttributes([]);
  };

  const handleCategoryChange = (categoryId: string) => {
    setForm({ ...form, category_id: categoryId, attributes: [] });
    loadAttributesByCategory(categoryId);
  };

  const addAttributeField = () => setForm({ ...form, attributes: [...form.attributes, { attribute_id: "", value: "" }] });
  const removeAttributeField = (i: number) => setForm({ ...form, attributes: form.attributes.filter((_, idx) => idx !== i) });
  const updateAttribute = (i: number, field: "attribute_id" | "value", val: string) => {
    const updated = [...form.attributes];
    // @ts-ignore
    updated[i][field] = val;
    setForm({ ...form, attributes: updated });
  };

  // ====================
  // Image handlers (main image)
  // ====================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) return toast.error("Chỉ chấp nhận ảnh!");
    if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không quá 2MB!");
    setForm({ ...form, image: file });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ====================
  // Sub images handlers
  // ====================
  // Accepts multiple files, pushes them into form.sub_images and also creates local previews appended after existing previews
  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: File[] = [];
    const readers: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error("Chỉ chấp nhận ảnh (jpg/png/webp)!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh không quá 2MB!");
        return;
      }
      newFiles.push(file);
      readers.push(new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      }));
    });

    // Update files immediately
    setForm(prev => ({ ...prev, sub_images: [...prev.sub_images, ...newFiles] }));

    // When readers done, append previews
    Promise.all(readers).then(results => {
      setSubImagePreviews(prev => [...prev, ...results]);
    }).catch(err => {
      console.error(err);
    });
  };

  // Remove sub image: if index is within old_sub_images length, remove from old_sub_images; otherwise remove from sub_images
  const removeSubImage = (index: number) => {
    // If target index less than old_sub_images length -> removing an existing image
    if (index < form.old_sub_images.length) {
      const newOld = [...form.old_sub_images];
      newOld.splice(index, 1);
      setForm({ ...form, old_sub_images: newOld });
      const previews = [...subImagePreviews];
      previews.splice(index, 1);
      setSubImagePreviews(previews);
      return;
    }
    // Else remove from new uploads
    const newIndex = index - form.old_sub_images.length;
    const newFiles = [...form.sub_images];
    newFiles.splice(newIndex, 1);
    setForm({ ...form, sub_images: newFiles });
    const previews = [...subImagePreviews];
    previews.splice(index, 1);
    setSubImagePreviews(previews);
  };

  // Helper to clear previews and revoke object URLs if created via URL.createObjectURL (here we used FileReader, so not needed to revoke)
  const clearPreviews = () => {
    setSubImagePreviews([]);
  };

  // ====================
  // Save product (create or update)
  // ====================
  const saveProduct = async () => {
  const productData = new FormData();
  productData.append("name", form.name.trim());
  productData.append("price", form.price);
  productData.append("stock", form.stock);
  productData.append("category_id", form.category_id);
  productData.append("is_new", form.is_new ? "1" : "0");
  productData.append("is_hot", form.is_hot ? "1" : "0");

  if (form.image) productData.append("image", form.image);

  form.old_sub_images.forEach(path => productData.append("old_sub_images[]", path));
  form.sub_images.forEach(file => productData.append("sub_images[]", file));

  // Thêm attributes theo index: attributes[0][attribute_id], attributes[0][value]
  form.attributes.forEach((attr, idx) => {
    if (!attr.attribute_id) return;
    productData.append(`attributes[${idx}][attribute_id]`, attr.attribute_id);
    productData.append(`attributes[${idx}][value]`, attr.value || "");
  });

  if (editingProductId) {
    productData.append("_method", "PUT");
  }

  const res = editingProductId
    ? await api.post(`/products/${editingProductId}`, productData)
    : await api.post("/products", productData);

  toast.success("Lưu sản phẩm thành công!");
  fetchProducts();
  closeForm();
};

  // ====================
  // Delete product
  // ====================
  const deleteProduct = async (id: number) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Xóa thành công!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại!");
    }
  };

  // ====================
  // Pagination & Filters
  // ====================
  const filteredProducts = Array.isArray(products)
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!categoryFilter || String(p.category_id) === categoryFilter)
    )
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ====================
  // Utility functions
  // ====================
  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);
  const calculateDiscount = (orig: number | null | undefined, sale: number) => orig && orig > sale ? Math.round(((orig - sale) / orig) * 100) : null;

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
                  Quản lý sản phẩm
                </h1>
                <p className="text-gray-600 mt-2">
                  Hiển thị: <span className="font-bold text-indigo-600">{currentProducts.length}</span> / {filteredProducts.length} sản phẩm
                </p>
              </div>
              <button onClick={() => openForm()} className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="w-5 h-5" /> Thêm sản phẩm
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Tìm tên sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-black font-medium" />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-black font-medium appearance-none">
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {currentProducts.length === 0 ? (
              <div className="p-20 text-center">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 font-medium">
                  {searchTerm || categoryFilter ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {currentProducts.map(p => {
                    const discount = calculateDiscount(p.original_price || null, p.price);
                    return (
                      <div key={p.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300">
                        <div className="aspect-square relative overflow-hidden bg-gray-100">
                          {p.image ? (
                            <img src={`http://127.0.0.1:8000/storage/${p.image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-20 h-20 text-gray-300" /></div>
                          )}
                          {discount && <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1"><Percent className="w-4 h-4" />-{discount}%</div>}
                          {(p.is_new || p.is_hot) && (
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              {p.is_new && <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Mới</span>}
                              {p.is_hot && <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" />Hot</span>}
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{p.name}</h3>
                          <div className="mt-4">
                            <p className="text-2xl font-extrabold text-emerald-600">{formatVND(p.price)}</p>
                            {p.original_price && p.original_price > p.price && <p className="text-sm text-gray-500 line-through mt-1">{formatVND(p.original_price)}</p>}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-3">
                            <Box className="w-4 h-4" />
                            <span>{p.stock} cái</span>
                          </div>

                          {/* SUB IMAGES PREVIEW ON CARD */}
                          {p.sub_images && p.sub_images.length > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              {p.sub_images.slice(0, 4).map((si, idx) => (
                                <img key={idx} src={`http://127.0.0.1:8000/storage/${si}`} alt={`sub-${idx}`} className="w-10 h-10 object-cover rounded-md border" />
                              ))}
                              {p.sub_images.length > 4 && <span className="text-xs text-gray-400">+{p.sub_images.length - 4}</span>}
                            </div>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openForm(p)} className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-indigo-100"><Edit3 className="w-4 h-4 text-indigo-600" /></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Trang <span className="font-bold text-indigo-600">{currentPage}</span> / {totalPages}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"><ChevronsLeft className="w-5 h-5" /></button>
                        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"><ChevronLeft className="w-5 h-5" /></button>
                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                          let page = currentPage <= 4 ? i + 1 : currentPage - 3 + i;
                          if (page > totalPages) return null;
                          return (
                            <button key={page} onClick={() => goToPage(page)} className={`w-10 h-10 rounded-lg font-medium ${currentPage === page ? "bg-indigo-600 text-white shadow-lg scale-110" : "hover:bg-gray-100 text-gray-700"}`}>
                              {page}
                            </button>
                          );
                        }).filter(Boolean)}
                        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"><ChevronRight className="w-5 h-5" /></button>
                        <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-black"><ChevronsRight className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ==================== FORM THÊM/SỬA ==================== */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                  <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6 text-gray-500" /></button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Tag className="w-4 h-4" /> Tên sản phẩm</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên sản phẩm..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><DollarSign className="w-4 h-4" /> Giá bán</label>
                        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Percent className="w-4 h-4" /> Giá gốc</label>
                        <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} placeholder="Để trống nếu không giảm" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Box className="w-4 h-4" /> Tồn kho</label>
                        <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                        <select value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                          <option value="">Chọn danh mục</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                        <span className="flex items-center gap-2 font-medium text-gray-800"><Sparkles className="w-5 h-5 text-red-500" /> Mới</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.is_hot} onChange={e => setForm({ ...form, is_hot: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
                        <span className="flex items-center gap-2 font-medium text-gray-800"><Flame className="w-5 h-5 text-orange-500" /> Hot</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><ImageIcon className="w-4 h-4" /> Hình ảnh</label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-indigo-500 cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {imagePreview ? <img src={imagePreview} alt="Preview" className="max-h-72 mx-auto rounded-lg shadow-md" /> : (
                          <div>
                            <ImageIcon className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Click để tải ảnh (tối đa 2MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SUB IMAGES */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><ImageIcon className="w-4 h-4" /> Ảnh phụ</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                        <input type="file" accept="image/*" multiple onChange={handleSubImagesChange} className="mb-3" />
                        <div className="grid grid-cols-3 gap-3">
                          {(form.old_sub_images.length + form.sub_images.length) === 0 && (
                            <p className="text-sm text-gray-400">Chưa có ảnh phụ</p>
                          )}
                          {form.old_sub_images.map((path, idx) => (
                            <div key={`old-${idx}`} className="relative group">
                              <img src={`http://127.0.0.1:8000/storage/${path}`} className="w-full h-24 object-cover rounded-lg" />
                              <button onClick={() => removeSubImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">X</button>
                            </div>
                          ))}
                          {form.sub_images.map((file, idx) => {
                            const previewIndex = idx + form.old_sub_images.length;
                            const preview = subImagePreviews[previewIndex] || URL.createObjectURL(file);
                            return (
                              <div key={`new-${idx}`} className="relative group">
                                <img src={preview} className="w-full h-24 object-cover rounded-lg" />
                                <button onClick={() => removeSubImage(form.old_sub_images.length + idx)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">X</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ATTRIBUTES */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Settings className="w-4 h-4" /> Thông số kỹ thuật</label>
                        <button onClick={addAttributeField} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Thêm thuộc tính</button>
                      </div>
                      <div className="space-y-3">
                        {form.attributes.length === 0 && (
                          <p className="text-sm text-gray-400 italic py-4 text-center bg-gray-50 rounded-lg">{form.category_id ? "Chưa có thuộc tính nào cho danh mục này" : "Vui lòng chọn danh mục trước"}</p>
                        )}
                        {form.attributes.map((attr, i) => (
                          <div key={i} className="flex gap-3 items-end">
                            <div className="flex-1">
                              <select value={attr.attribute_id} onChange={e => updateAttribute(i, "attribute_id", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                <option value="">Chọn thuộc tính</option>
                                {categoryAttributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                              </select>
                            </div>
                            <div className="flex-1">
                              <input type="text" value={attr.value || ""} onChange={e => updateAttribute(i, "value", e.target.value)} placeholder="Giá trị (VD: Space Gray, 256GB)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                            </div>
                            <button onClick={() => removeAttributeField(i)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</label>
                      <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20">
                        <TiptapEditor
                          value={form.description}
                          onChange={(html) => setForm({ ...form, description: html })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4">
                  <button onClick={closeForm} className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Hủy</button>
                  <button onClick={saveProduct} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 shadow-lg transform hover:scale-105">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? "Đang lưu..." : "Lưu sản phẩm"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}