"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [form, setForm] = useState<{
    name: string;
    price: string;
    original_price: string;
    stock: string;
    category_id: string;
    image: File | null;
    is_new: boolean;
    is_hot: boolean;
  }>({
    name: "",
    price: "",
    original_price: "",
    stock: "",
    category_id: "",
    image: null,
    is_new: false,
    is_hot: false,
  });

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "",
    immediatelyRender: false,
  });

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  const openForm = (product?: Product) => {
    if (product) {
      setEditingProductId(product.id);
      setForm({
        name: product.name,
        price: String(product.price),
        original_price: product.original_price ? String(product.original_price) : "",
        stock: String(product.stock),
        category_id: String(product.category_id),
        image: null,
        is_new: product.is_new || false,
        is_hot: product.is_hot || false,
      });
      editor?.commands.setContent(product.description);
    } else {
      setEditingProductId(null);
      setForm({
        name: "",
        price: "",
        original_price: "",
        stock: "",
        category_id: "",
        image: null,
        is_new: false,
        is_hot: false,
      });
      editor?.commands.setContent("");
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const saveProduct = async () => {
  if (!form.name.trim()) return alert("Nhập tên sản phẩm!");
  if (!form.price.trim()) return alert("Nhập giá bán!");
  if (!form.stock.trim()) return alert("Nhập số lượng!");
  if (!form.category_id) return alert("Chọn danh mục!");

  setLoading(true);
  
  // BẮT ĐẦU TẠO FORMDATA
  const data = new FormData();

  data.append("name", form.name);
  data.append("price", form.price);
  if (form.original_price.trim()) data.append("original_price", form.original_price);
  data.append("stock", form.stock);
  data.append("category_id", form.category_id);
  data.append("description", editor?.getHTML() || "");
  data.append("is_new", form.is_new ? "1" : "0");
  data.append("is_hot", form.is_hot ? "1" : "0");
  if (form.image) data.append("image", form.image);

  // THÊM DÒNG NÀY NGAY SAU KHI APPEND XONG – CHỖ DUY NHẤT!
  console.log("FormData đang gửi:", [...data.entries()]);

  // Nếu sửa sản phẩm → thêm _method
  if (editingProductId) {
    data.append("_method", "PUT");
  }

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
    // ... xử lý lỗi
  } finally {
    setLoading(false);
  }
};

  const deleteProduct = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    await api.delete(`/products/${id}`);
    await fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="p-5 text-black">
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
      <button
        onClick={() => openForm()}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Thêm sản phẩm
      </button>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative text-black">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nhập tên sản phẩm"
                      className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Giá gốc</label>
                      <input
                        value={form.original_price}
                        onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                        placeholder="Giá gốc (tùy chọn)"
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Giá bán</label>
                      <input
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="Giá bán"
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Số lượng</label>
                    <input
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="Nhập số lượng"
                      type="number"
                      className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Danh mục</label>
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hình ảnh</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files?.[0] || null })
                      }
                      className="w-full text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_new"
                        checked={form.is_new}
                        onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_new" className="text-sm font-medium text-gray-700">Sản phẩm mới</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_hot"
                        checked={form.is_hot}
                        onChange={(e) => setForm({ ...form, is_hot: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">Sản phẩm hot</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mô tả</label>
                    <EditorContent
                      editor={editor}
                      className="border border-gray-300 p-3 rounded-lg min-h-[120px] text-black focus-within:ring-2 focus-within:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveProduct}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá gốc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.original_price ? `${p.original_price.toLocaleString()}đ` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                    {p.price.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {categories.find((c) => c.id === p.category_id)?.name || p.category_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {p.is_new && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Mới
                        </span>
                      )}
                      {p.is_hot && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Hot
                        </span>
                      )}
                      {!p.is_new && !p.is_hot && (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openForm(p)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
