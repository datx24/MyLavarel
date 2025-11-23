"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import api from "@/utils/api";

interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_gender: "anh",
    province: "",
    district: "",
    ward: "",
    street: "",
    note: "",
    need_invoice: false,
    payment_method: "cod",
  });

  // API Tỉnh Huyện Xã
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // --- Load tỉnh ---
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error(err));
  }, []);

  // --- Load sản phẩm vào giỏ ---
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const productId = searchParams.get("product");

    if (productId) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${productId}`);
          const product = res.data;

          const existingItem = cart.find(
            (item: CartItem) => item.product_id === product.id
          );

          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push({
              product_id: product.id,
              quantity: 1,
              name: product.name,
              price: product.price,
              image: product.image,
            });
          }

          localStorage.setItem("cart", JSON.stringify(cart));
          setCartItems(cart);
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };

      fetchProduct();
    } else {
      setCartItems(cart);
    }
  }, [searchParams]);

  // Hàm xử lý form change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // --- Khi chọn tỉnh ---
  const handleProvince = async (e: any) => {
    const code = e.target.value;
    const name = provinces.find((p) => p.code == code)?.name;

    setFormData((p) => ({ ...p, province: name || "", district: "", ward: "" }));

    setDistricts([]);
    setWards([]);

    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`
    );
    const data = await res.json();
    setDistricts(data.districts || []);
  };

  // --- Khi chọn huyện ---
  const handleDistrict = async (e: any) => {
    const code = e.target.value;
    const name = districts.find((d) => d.code == code)?.name;

    setFormData((p) => ({ ...p, district: name || "", ward: "" }));
    setWards([]);

    const res = await fetch(
      `https://provinces.open-api.vn/api/d/${code}?depth=2`
    );
    const data = await res.json();
    setWards(data.wards || []);
  };

  // --- Khi chọn xã ---
  const handleWard = (e: any) => {
    const code = e.target.value;
    const name = wards.find((w) => w.code == code)?.name;

    setFormData((p) => ({ ...p, ward: name || "" }));
  };

  // Cập nhật số lượng
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) return removeItem(productId);

    const updatedCart = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Xóa sản phẩm
  const removeItem = (productId: number) => {
    const updatedCart = cartItems.filter((item) => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Submit đơn hàng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const response = await api.post("/guest-orders", {
        ...formData,
        items,
      });

      if (response.data.success) {
        localStorage.removeItem("cart");
        setCartItems([]);
        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.data.order.code}`);
        router.push("/");
      } else {
        alert("Đặt hàng thất bại: " + response.data.message);
      }
    } catch (error: any) {
      alert("Lỗi đặt hàng: " + (error.response?.data?.message || "Vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl text-black font-bold mb-8">Giỏ hàng</h1>

          {/* GIỎ HÀNG */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <img
                    src={`http://127.0.0.1:8000/storage/${item.image}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-black">{item.name}</h3>
                    <p className="text-gray-600">
                      {Number(item.price).toLocaleString()}đ
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="text-black w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="text-black w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-black">
                      {Number(item.price * item.quantity).toLocaleString()}đ
                    </p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM THÔNG TIN */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Thông tin đặt hàng
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                <div>
                  <label className="block text-sm font-semibold mb-2">Họ tên *</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="038xxxxx"
                    pattern="^(03|05|07|08|09)\d{8}$"
                  />
                </div>
              </div>

              {/* Email + Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Giới tính *
                  </label>
                  <select
                    name="customer_gender"
                    required
                    value={formData.customer_gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg bg-white"
                  >
                    <option value="anh">Anh</option>
                    <option value="chi">Chị</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Tỉnh - Huyện - Xã */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
                {/* Province */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border rounded-lg bg-white"
                    onChange={handleProvince}
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Quận/Huyện *
                  </label>
                  <select
                    required
                    disabled={districts.length === 0}
                    className="w-full px-4 py-3 border rounded-lg bg-white"
                    onChange={handleDistrict}
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phường/Xã *
                  </label>
                  <select
                    required
                    disabled={wards.length === 0}
                    className="w-full px-4 py-3 border rounded-lg bg-white"
                    onChange={handleWard}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street */}
              <div className="text-black">
                <label className="block text-sm font-semibold mb-2">
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              {/* Note */}
              <div className="text-black">
                <label className="block text-sm font-semibold mb-2">Ghi chú</label>
                <textarea
                  name="note"
                  rows={3}
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg resize-none"
                  placeholder="Ghi chú thêm (tùy chọn)"
                />
              </div>

              {/* Invoice */}
              <div className="flex items-center space-x-3 text-black">
                <input
                  type="checkbox"
                  name="need_invoice"
                  checked={formData.need_invoice}
                  onChange={handleInputChange}
                  className="h-5 w-5 border rounded"
                />
                <label className="text-sm font-semibold">Cần xuất hóa đơn</label>
              </div>

              {/* Payment */}
              <div className="text-black">
                <label className="block text-sm font-semibold mb-3">
                  Phương thức thanh toán *
                </label>

                <div className="space-y-3">
                  {[
                    { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
                    { value: "bank", label: "Chuyển khoản ngân hàng" },
                    { value: "momo", label: "Ví MoMo" },
                    { value: "vnpay", label: "VNPay" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={m.value}
                        checked={formData.payment_method === m.value}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* TỔNG TIỀN */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-black">
            <div className="flex justify-between mb-4">
              <span>Tạm tính:</span>
              <span className="font-bold">
                {Number(subtotal).toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Phí vận chuyển:</span>
              <span className="font-bold">
                {Number(shippingFee).toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Tổng cộng:</span>
              <span>{Number(total).toLocaleString()}đ</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300"
              >
                Tiếp tục mua sắm
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
