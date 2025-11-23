// page.tsx (đã tối giản)
"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Package, Plus, Search, Filter } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { ProductForm, ProductGrid } from "@/components/admin/product";


interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Attribute {
  id: number;
  name: string;
  type: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number | null;
  stock: number;
  image?: string | null;
  sub_images?: string[];
  category_id: number;
  is_new?: boolean;
  is_hot?: boolean;
  category?: Category | null;
  attributes?: any[] | null;
}

const ITEMS_PER_PAGE = 4;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    stock: "",
    category_id: "",
    image: null as File | null,
    sub_images: [] as File[],
    old_sub_images: [] as string[],
    is_new: false,
    is_hot: false,
    attributes: [] as { attribute_id: string; value: string; attribute_name?: string }[],
  });

  // Fetch data functions
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
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
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // Form handlers
  const openForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
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
      setEditingProduct(null);
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

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addAttributeField = () => setForm(prev => ({ 
    ...prev, 
    attributes: [...prev.attributes, { attribute_id: "", value: "" }] 
  }));

  const removeAttributeField = (i: number) => setForm(prev => ({ 
    ...prev, 
    attributes: prev.attributes.filter((_, idx) => idx !== i) 
  }));

  const updateAttribute = (i: number, field: "attribute_id" | "value", val: string) => {
    setForm(prev => {
      const updated = [...prev.attributes];
      updated[i][field] = val;
      return { ...prev, attributes: updated };
    });
  };

  // Image handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) return toast.error("Chỉ chấp nhận ảnh!");
    if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không quá 2MB!");
    setForm(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

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

    setForm(prev => ({ ...prev, sub_images: [...prev.sub_images, ...newFiles] }));

    Promise.all(readers).then(results => {
      setSubImagePreviews(prev => [...prev, ...results]);
    }).catch(err => {
      console.error(err);
    });
  };

  const removeSubImage = (index: number) => {
    if (index < form.old_sub_images.length) {
      const newOld = [...form.old_sub_images];
      newOld.splice(index, 1);
      setForm(prev => ({ ...prev, old_sub_images: newOld }));
      const previews = [...subImagePreviews];
      previews.splice(index, 1);
      setSubImagePreviews(previews);
      return;
    }
    const newIndex = index - form.old_sub_images.length;
    const newFiles = [...form.sub_images];
    newFiles.splice(newIndex, 1);
    setForm(prev => ({ ...prev, sub_images: newFiles }));
    const previews = [...subImagePreviews];
    previews.splice(index, 1);
    setSubImagePreviews(previews);
  };

  // Save product
  const saveProduct = async () => {
    setLoading(true);
    try {
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

      form.attributes.forEach((attr, idx) => {
        if (!attr.attribute_id) return;
        productData.append(`attributes[${idx}][attribute_id]`, attr.attribute_id);
        productData.append(`attributes[${idx}][value]`, attr.value || "");
      });

      if (editingProduct) {
        productData.append("_method", "PUT");
        await api.post(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post("/products", productData);
      }

      toast.success("Lưu sản phẩm thành công!");
      fetchProducts();
      closeForm();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
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

  // Pagination & Filters
  const filteredProducts = Array.isArray(products)
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!categoryFilter || String(p.category_id) === categoryFilter)
    )
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                <input 
                  type="text" 
                  placeholder="Tìm tên sản phẩm..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-black font-medium" 
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-black font-medium appearance-none"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={currentProducts}
            onEdit={openForm}
            onDelete={deleteProduct}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {/* Product Form */}
          <ProductForm
            show={showForm}
            editingProduct={editingProduct}
            form={form}
            categories={categories}
            categoryAttributes={categoryAttributes}
            imagePreview={imagePreview}
            subImagePreviews={subImagePreviews}
            loading={loading}
            onClose={closeForm}
            onFormChange={handleFormChange}
            onCategoryChange={handleCategoryChange}
            onImageChange={handleImageChange}
            onSubImagesChange={handleSubImagesChange}
            onRemoveSubImage={removeSubImage}
            onAddAttribute={addAttributeField}
            onRemoveAttribute={removeAttributeField}
            onUpdateAttribute={updateAttribute}
            onSave={saveProduct}
          />
        </div>
      </div>
    </>
  );
}