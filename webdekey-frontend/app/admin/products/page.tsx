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
  stock: number;
  image?: string;
  category_id: number;
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
    stock: string;
    category_id: string;
    image: File | null;
  }>({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    image: null,
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
        stock: String(product.stock),
        category_id: String(product.category_id),
        image: null,
      });
      editor?.commands.setContent(product.description);
    } else {
      setEditingProductId(null);
      setForm({ name: "", price: "", stock: "", category_id: "", image: null });
      editor?.commands.setContent("");
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const saveProduct = async () => {
    if (!form.name.trim()) return alert("Nhập tên sản phẩm!");
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category_id", form.category_id);
      data.append("description", editor?.getHTML() || "");
      if (form.image) data.append("image", form.image);

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, data); 
      } else {
        await api.post("/products", data);
      }

      await fetchProducts();
      closeForm();
    } catch (err: any) {
      console.error(err.response?.data);
      alert(JSON.stringify(err.response?.data?.errors, null, 2));
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded w-full max-w-xl relative text-black">
            <button
              onClick={closeForm}
              className="absolute top-2 right-2 text-red-500 font-bold"
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-3">
              {editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h2>
            <div className="flex flex-col gap-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên sản phẩm"
                className="border p-2 rounded text-black"
              />
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Giá"
                type="number"
                className="border p-2 rounded text-black"
              />
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Số lượng"
                type="number"
                className="border p-2 rounded text-black"
              />
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="border p-2 rounded text-black"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files?.[0] || null })
                }
                className="text-black"
              />
              <label className="mt-2 font-semibold">Mô tả:</label>
              <EditorContent
                editor={editor}
                className="border p-2 rounded min-h-[150px] text-black"
              />
              <button
                onClick={saveProduct}
                disabled={loading}
                className="bg-green-600 text-white p-2 rounded mt-3"
              >
                {loading ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full border-collapse border border-black bg-white">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th className="border border-black p-2">ID</th>
            <th className="border border-black p-2">Tên</th>
            <th className="border border-black p-2">Giá</th>
            <th className="border border-black p-2">Số lượng</th>
            <th className="border border-black p-2">Category</th>
            <th className="border border-black p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-black">
              <td className="border border-black p-2 text-center">{p.id}</td>
              <td className="border border-black p-2">{p.name}</td>
              <td className="border border-black p-2">{p.price}</td>
              <td className="border border-black p-2">{p.stock}</td>
              <td className="border border-black p-2">
                {
                  categories.find((c) => c.id === p.category_id)?.name ||
                  p.category_id
                }
              </td>
              <td className="border border-black p-2 text-center">
                <button
                  onClick={() => openForm(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
