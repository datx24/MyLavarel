"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  ChevronLeft,
  Receipt,
  ShoppingBag,
} from "lucide-react";

interface Order {
  id: number;
  user_id?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    image?: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrder();
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: "Chờ xác nhận", icon: Clock, bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
      confirmed: { label: "Đã xác nhận", icon: CheckCircle, bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
      shipping: { label: "Đang giao", icon: Truck, bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
      completed: { label: "Hoàn thành", icon: CheckCircle, bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
      cancelled: { label: "Đã hủy", icon: XCircle, bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    };
    return configs[status as keyof typeof configs] || { label: status, icon: Package, bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <a href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng <span className="text-indigo-600">#{order.id}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Đặt lúc: {format(new Date(order.created_at), "HH:mm, dd 'tháng' MM, yyyy", { locale: vi })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchOrder}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
              </button>

              <div className="flex items-center gap-2">
                <StatusIcon className="w-5 h-5" />
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} focus:outline-none focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all`}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Thông tin khách hàng</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Họ tên</p>
                    <p className="text-gray-900 font-semibold">{order.guest_name || "Khách lẻ"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900 font-semibold">{order.guest_email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                    <p className="text-gray-900 font-semibold">{order.guest_phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Địa chỉ giao hàng</p>
                    <p className="text-gray-900 font-semibold">{order.guest_address || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Sản phẩm trong đơn hàng</h2>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors ${index !== order.items.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                      {item.product.image ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.price.toLocaleString()}đ × {item.quantity} sản phẩm
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Ngày đặt</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {format(new Date(order.created_at), "dd/MM/yyyy", { locale: vi })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Cập nhật</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {format(new Date(order.updated_at), "HH:mm, dd/MM", { locale: vi })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm">Trạng thái</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-3xl font-extrabold text-emerald-600">
                      {formatVND(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}