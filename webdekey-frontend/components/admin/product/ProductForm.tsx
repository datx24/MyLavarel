"use client";

import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import { X, Save, Loader2, Tag, DollarSign, Box, Percent, Settings, Trash, Plus, Sparkles, Flame, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import TiptapEditor from "@/components/admin/TiptapEditor";

interface Category { id: number; name: string; }
interface Attribute { id: number; name: string; type: string; }

interface ProductFormProps {
  show: boolean;
  onClose: () => void;
  editingProductId?: number | null;
  onSave: () => void;
  categories: Category[];
}

interface FormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  stock: string;
  category_id: string;
  image: File | null;
  sub_images: File[];
  old_sub_images: string[];
  is_new: boolean;
  is_hot: boolean;
  attributes: { attribute_id: string; value: string }[];
}

const ProductForm: React.FC<ProductFormProps> = ({ show, onClose, editingProductId, onSave, categories }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [form, setForm] = useState<FormData>({
    name: "", description: "", price: "", original_price: "", stock: "",
    category_id: "", image: null, sub_images: [], old_sub_images: [],
    is_new: false, is_hot: false, attributes: []
  });

  // --- Fetch product for edit ---
  useEffect(() => {
    if (editingProductId && show) fetchProductData();
  }, [editingProductId, show]);

  const fetchProductData = async () => {
    try {
      const res = await api.get(`/products/${editingProductId}`);
      const product = res.data.data;
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price || ""),
        original_price: product.original_price ? String(product.original_price) : "",
        stock: String(product.stock || 0),
        category_id: String(product.category_id || ""),
        image: null,
        sub_images: [],
        old_sub_images: product.sub_images || [],
        is_new: !!product.is_new,
        is_hot: !!product.is_hot,
        attributes: (product.attributes || []).map((a: any) => ({
          attribute_id: String(a.attribute_id), value: a.value || ""
        }))
      });
      setImagePreview(product.image ? `http://127.0.0.1:8000/storage/${product.image}` : null);
      setSubImagePreviews((product.sub_images || []).map((img: string) => `http://127.0.0.1:8000/storage/${img}`));
      if (product.category_id) loadAttributesByCategory(String(product.category_id));
    } catch (err) { console.error(err); toast.error("Không thể tải dữ liệu sản phẩm"); }
  };

  const loadAttributesByCategory = async (categoryId: string) => {
    if (!categoryId) return setCategoryAttributes([]);
    try {
      const res = await api.get(`admin/attributes-by-category/${categoryId}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategoryAttributes(list);
    } catch (err) { console.error(err); toast.error("Không tải được thuộc tính"); setCategoryAttributes([]); }
  };

  const handleCategoryChange = (categoryId: string) => {
    setForm({ ...form, category_id: categoryId, attributes: [] });
    loadAttributesByCategory(categoryId);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setForm({ ...form, image: file });
    const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file);
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const newFiles: File[] = [], readers: Promise<string>[] = [];
    Array.from(files).forEach(file => {
      newFiles.push(file);
      readers.push(new Promise(resolve => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(file);
      }));
    });
    setForm(prev => ({ ...prev, sub_images: [...prev.sub_images, ...newFiles] }));
    Promise.all(readers).then(results => setSubImagePreviews(prev => [...prev, ...results]));
  };

  const removeSubImage = (index: number) => {
    if (index < form.old_sub_images.length) {
      const newOld = [...form.old_sub_images]; newOld.splice(index, 1);
      setForm({ ...form, old_sub_images: newOld });
    } else {
      const newIndex = index - form.old_sub_images.length;
      const newFiles = [...form.sub_images]; newFiles.splice(newIndex, 1);
      setForm({ ...form, sub_images: newFiles });
    }
    const previews = [...subImagePreviews]; previews.splice(index, 1); setSubImagePreviews(previews);
  };

  const addAttributeField = () => setForm({ ...form, attributes: [...form.attributes, { attribute_id: "", value: "" }] });
  const removeAttributeField = (i: number) => setForm({ ...form, attributes: form.attributes.filter((_, idx) => idx !== i) });
  const updateAttribute = (i: number, field: "attribute_id" | "value", val: string) => {
    const updated = [...form.attributes]; updated[i][field] = val; setForm({ ...form, attributes: updated });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const productData = new FormData();
      productData.append("name", form.name.trim());
      productData.append("price", form.price);
      productData.append("stock", form.stock);
      productData.append("category_id", form.category_id);
      productData.append("is_new", form.is_new ? "1" : "0");
      productData.append("is_hot", form.is_hot ? "1" : "0");
      productData.append("description", form.description);
      if (form.image) productData.append("image", form.image);
      form.old_sub_images.forEach(path => productData.append("old_sub_images[]", path));
      form.sub_images.forEach(file => productData.append("sub_images[]", file));
      form.attributes.forEach((attr, idx) => {
        if (!attr.attribute_id) return;
        productData.append(`attributes[${idx}][attribute_id]`, attr.attribute_id);
        productData.append(`attributes[${idx}][value]`, attr.value || "");
      });

      if (editingProductId) { productData.append("_method", "PUT"); await api.post(`/products/${editingProductId}`, productData); }
      else { await api.post("/products", productData); }

      toast.success("Lưu sản phẩm thành công!"); onSave(); handleClose();
    } catch (err) { console.error(err); toast.error("Lỗi lưu sản phẩm!"); }
    finally { setLoading(false); }
  };

  const handleClose = () => {
    setForm({ name: "", description: "", price: "", original_price: "", stock: "", category_id: "", image: null, sub_images: [], old_sub_images: [], is_new: false, is_hot: false, attributes: [] });
    setImagePreview(null); setSubImagePreviews([]); setCategoryAttributes([]); onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Tag className="w-4 h-4"/> Tên sản phẩm</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none"/>
            </div>

            {/* Price / Original Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><DollarSign className="w-4 h-4"/> Giá bán</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none"/>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Percent className="w-4 h-4"/> Giá gốc</label>
                <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none"/>
              </div>
            </div>

            {/* Stock / Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Box className="w-4 h-4"/> Tồn kho</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none"/>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                <select value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none">
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* is_new / is_hot */}
            <div className="flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} className="w-5 h-5 text-red-600 rounded"/>
                <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-red-500"/> Mới</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_hot} onChange={e => setForm({ ...form, is_hot: e.target.checked })} className="w-5 h-5 text-orange-600 rounded"/>
                <span className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500"/> Hot</span>
              </label>
            </div>
          </div>

          {/* Image / Sub Images / Attributes */}
          <div className="space-y-6">
            {/* Image */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><ImageIcon className="w-4 h-4"/> Hình ảnh</label>
              <div className="relative border-2 border-dashed p-10 text-center hover:border-indigo-500 cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                {imagePreview ? <img src={imagePreview} className="max-h-72 mx-auto rounded-lg"/> : <div className="text-gray-600">Click để tải ảnh</div>}
              </div>
            </div>

            {/* Sub Images */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><ImageIcon className="w-4 h-4"/> Ảnh phụ</label>
              <input type="file" accept="image/*" multiple onChange={handleSubImagesChange} className="mb-3"/>
              <div className="grid grid-cols-3 gap-3">
                {(form.old_sub_images.concat(form.sub_images.map(f => ""))).map((_, idx) => (
                  <div key={idx} className="relative group">
                    <img src={subImagePreviews[idx] || `http://127.0.0.1:8000/storage/${form.old_sub_images[idx]}`} className="w-full h-24 object-cover rounded-lg"/>
                    <button onClick={() => removeSubImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">X</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Settings className="w-4 h-4"/> Thông số kỹ thuật</label>
                <button onClick={addAttributeField} className="text-indigo-600 flex items-center gap-1"><Plus className="w-4 h-4"/> Thêm thuộc tính</button>
              </div>
              <div className="space-y-3">
                {form.attributes.map((attr, i) => (
                  <div key={i} className="flex gap-3 items-end">
                    <select value={attr.attribute_id} onChange={e => updateAttribute(i, "attribute_id", e.target.value)} className="flex-1 px-4 py-2.5 border rounded-lg">
                      <option value="">Chọn thuộc tính</option>
                      {categoryAttributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input type="text" value={attr.value} onChange={e => updateAttribute(i, "value", e.target.value)} placeholder="Giá trị" className="flex-1 px-4 py-2.5 border rounded-lg"/>
                    <button onClick={() => removeAttributeField(i)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash className="w-4 h-4"/></button>
                  </div>
                ))}
                {form.attributes.length === 0 && <p className="text-sm text-gray-400 italic text-center bg-gray-50 rounded-lg p-4">{form.category_id ? "Chưa có thuộc tính" : "Vui lòng chọn danh mục"}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</label>
            <div className="border rounded-xl overflow-hidden"><TiptapEditor value={form.description} onChange={html => setForm({ ...form, description: html })} /></div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4">
          <button onClick={handleClose} className="px-6 py-3 border rounded-xl">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
