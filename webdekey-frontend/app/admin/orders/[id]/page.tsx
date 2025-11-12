"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      await fetchOrder();
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao hàng";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-5">
        <div className="text-center">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  return (
    <div className="p-5 text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
        <div className="flex items-center gap-4">
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                <p className="mt-1 text-sm text-gray-900">{order.guest_name || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{order.guest_email || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <p className="mt-1 text-sm text-gray-900">{order.guest_phone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <p className="mt-1 text-sm text-gray-900">{order.guest_address || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                      {item.product.image && (
                        <img
                          src={`http://127.0.0.1:8000/storage/${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                    <p className="text-sm text-gray-500">{item.price.toLocaleString()}đ x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ngày tạo:</span>
                <span className="text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cập nhật cuối:</span>
                <span className="text-sm text-gray-900">
                  {new Date(order.updated_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng tiền:</span>
                  <span className="text-orange-600">{order.total.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
