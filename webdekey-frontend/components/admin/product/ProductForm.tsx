// components/admin/ProductForm.tsx
import React from 'react';
import {
  X, Save, Loader2, Tag, DollarSign, Box, Percent,
  Settings, Trash, ImageIcon, Sparkles, Flame, Plus,
  FileText, Package,
  Upload
} from 'lucide-react';
import TiptapEditor from "@/components/admin/TiptapEditor";

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

interface ProductFormProps {
  show: boolean;
  editingProduct: Product | null;
  form: {
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
    attributes: { attribute_id: string; value: string; attribute_name?: string }[];
  };
  categories: Category[];
  categoryAttributes: Attribute[];
  imagePreview: string | null;
  subImagePreviews: string[];
  loading: boolean;
  onClose: () => void;
  onFormChange: (field: string, value: any) => void;
  onCategoryChange: (categoryId: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveSubImage: (index: number) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onUpdateAttribute: (index: number, field: "attribute_id" | "value", value: string) => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  show,
  editingProduct,
  form,
  categories,
  categoryAttributes,
  imagePreview,
  subImagePreviews,
  loading,
  onClose,
  onFormChange,
  onCategoryChange,
  onImageChange,
  onSubImagesChange,
  onRemoveSubImage,
  onAddAttribute,
  onRemoveAttribute,
  onUpdateAttribute,
  onSave
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingProduct ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới trong cửa hàng"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Thông tin cơ bản
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4" />
                      Tên sản phẩm
                    </label>
                    <input
                      value={form.name}
                      onChange={e => onFormChange("name", e.target.value)}
                      placeholder="Nhập tên sản phẩm..."
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Giá bán
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => onFormChange("price", e.target.value)}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Percent className="w-4 h-4" />
                        Giá gốc
                      </label>
                      <input
                        type="number"
                        value={form.original_price}
                        onChange={e => onFormChange("original_price", e.target.value)}
                        placeholder="Để trống nếu không giảm"
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Box className="w-4 h-4" />
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={e => onFormChange("stock", e.target.value)}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={form.category_id}
                        onChange={e => onCategoryChange(e.target.value)}
                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Flags */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  Trạng thái sản phẩm
                </h3>
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.is_new}
                        onChange={e => onFormChange("is_new", e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500 opacity-0 absolute"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${form.is_new
                        ? 'bg-red-600 border-red-600'
                        : 'bg-white border-gray-300 group-hover:border-red-400'
                        }`}>
                        {form.is_new && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="flex items-center gap-2 font-medium text-gray-800">
                      <Sparkles className="w-5 h-5 text-red-500" />
                      Sản phẩm mới
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.is_hot}
                        onChange={e => onFormChange("is_hot", e.target.checked)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 opacity-0 absolute"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${form.is_hot
                        ? 'bg-orange-600 border-orange-600'
                        : 'bg-white border-gray-300 group-hover:border-orange-400'
                        }`}>
                        {form.is_hot && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="flex items-center gap-2 font-medium text-gray-800">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Sản phẩm hot
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Media & Attributes */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Hình ảnh chính
                </h3>

                <div className="relative group">
                  {/* Input ẩn */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                  />

                  {/* Trường hợp đã có ảnh */}
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-80 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Overlay tinh tế + nút thay đổi ảnh nổi bật */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <div className="flex items-center gap-3 text-white font-medium bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 shadow-lg">
                          <Upload className="w-5 h-5" />
                          Thay đổi ảnh
                        </div>
                      </div>

                      {/* Viền viền nhẹ khi hover */}
                      <div className="absolute inset-0 rounded-xl ring-4 ring-transparent group-hover:ring-blue-500/30 transition-all duration-300 pointer-events-none" />
                    </div>
                  ) : (
                    /* Trường hợp chưa có ảnh */
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/50 group">
                      <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="text-gray-700 font-medium text-lg">Click để tải ảnh lên</p>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP • Tối đa 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub Images */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  Ảnh phụ
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({form.old_sub_images.length + form.sub_images.length} ảnh)
                  </span>
                </h3>

                <div className="space-y-4">

                  {/* CLICK CẢ VÙNG */}
                  <label
                    htmlFor="subImages"
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 
                 transition-all duration-200 hover:border-green-500 cursor-pointer block"
                  >
                    {/* Input file hidden */}
                    <input
                      id="subImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onSubImagesChange}
                      className="hidden"
                    />

                    <div className="grid grid-cols-3 gap-3">

                      {(form.old_sub_images.length + form.sub_images.length) === 0 && (
                        <div className="col-span-3 text-center py-6 pointer-events-none">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Chưa có ảnh phụ (click để chọn)</p>
                        </div>
                      )}

                      {/* Old images */}
                      {form.old_sub_images.map((path, idx) => (
                        <div key={`old-${idx}`} className="relative group">
                          <img
                            src={`http://127.0.0.1:8000/storage/${path}`}
                            className="w-full h-20 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            onClick={(e) => { e.preventDefault(); onRemoveSubImage(idx); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* New images */}
                      {form.sub_images.map((file, idx) => {
                        const previewIndex = idx + form.old_sub_images.length;
                        const preview = subImagePreviews[previewIndex] || URL.createObjectURL(file);
                        return (
                          <div key={`new-${idx}`} className="relative group">
                            <img
                              src={preview}
                              className="w-full h-20 object-cover rounded-lg shadow-sm"
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                onRemoveSubImage(form.old_sub_images.length + idx);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Attributes Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Settings className="w-5 h-5 text-purple-600" />
                Thông số kỹ thuật
              </h3>
              <button
                onClick={onAddAttribute}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Thêm thuộc tính
              </button>
            </div>

            <div className="space-y-3">
              {form.attributes.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    {form.category_id ? "Chưa có thuộc tính nào" : "Vui lòng chọn danh mục trước"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {form.category_id ? "Thêm thuộc tính để mô tả chi tiết sản phẩm" : "Danh mục sẽ xác định các thuộc tính có sẵn"}
                  </p>
                </div>
              )}

              {form.attributes.map((attr, i) => (
                <div key={i} className="text-black flex gap-3 items-start bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Thuộc tính</label>
                    <select
                      value={attr.attribute_id}
                      onChange={e => onUpdateAttribute(i, "attribute_id", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200"
                    >
                      <option value="">Chọn thuộc tính</option>
                      {categoryAttributes.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Giá trị</label>
                    <input
                      type="text"
                      value={attr.value || ""}
                      onChange={e => onUpdateAttribute(i, "value", e.target.value)}
                      placeholder="Nhập giá trị..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveAttribute(i)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-6"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded-2xl">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              Mô tả chi tiết
            </h3>
            <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all duration-200">
              <TiptapEditor
                value={form.description}
                onChange={(html) => onFormChange("description", html)}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;