"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_gender: 'anh',
    province: '',
    district: '',
    ward: '',
    street: '',
    note: '',
    need_invoice: false,
    payment_method: 'cod',
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (productId: number) => {
    const updatedCart = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const response = await api.post('/guest-orders', {
        ...formData,
        items,
      });

      if (response.data.success) {
        // Clear cart
        localStorage.removeItem('cart');
        setCartItems([]);
        window.dispatchEvent(new Event('storage'));
        alert(`Đặt hàng thành công! Mã đơn hàng: ${response.data.order.code}`);
        router.push('/');
      } else {
        alert('Đặt hàng thất bại: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Order error:', error);
      alert('Lỗi đặt hàng: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
              onClick={() => router.push('/')}
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

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 border-b pb-4">
                  <img
                    src={`http://127.0.0.1:8000/storage/${item.image}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-black">{item.name}</h3>
                    <p className="text-gray-600">{Number(item.price).toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="text-black w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="text-black w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-black">{Number(item.price * item.quantity).toLocaleString()}đ</p>
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

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Thông tin đặt hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Họ tên *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    pattern="^(03|05|07|08|09)\d{8}$"
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Ví dụ: 0987654321"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giới tính *
                  </label>
                  <select
                    name="customer_gender"
                    value={formData.customer_gender}
                    onChange={handleInputChange}
                    required
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="anh">Anh</option>
                    <option value="chi">Chị</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="text-black grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Hà Nội"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Hoàn Kiếm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phường/Xã *
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    required
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Tràng Tiền"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Số nhà, tên đường, ngõ..."
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Ghi chú về đơn hàng (tùy chọn)"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="need_invoice"
                  checked={formData.need_invoice}
                  onChange={handleInputChange}
                  className="text-black h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-900">
                  Cần xuất hóa đơn
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Phương thức thanh toán *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleInputChange}
                      className="text-black h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank"
                      checked={formData.payment_method === 'bank'}
                      onChange={handleInputChange}
                      className="text-black h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">Chuyển khoản ngân hàng</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={formData.payment_method === 'momo'}
                      onChange={handleInputChange}
                      className="text-black h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">Ví MoMo</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={formData.payment_method === 'vnpay'}
                      onChange={handleInputChange}
                      className="text-black h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">VNPay</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4 text-black">
              <span>Tạm tính:</span>
              <span className="font-bold">{Number(subtotal).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-black">
              <span>Phí vận chuyển:</span>
              <span className="font-bold">{Number(shippingFee).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center text-xl text-black font-bold mb-6">
              <span>Tổng cộng:</span>
              <span>{Number(total).toLocaleString()}đ</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition"
              >
                Tiếp tục mua sắm
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
