"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Package,
  Calendar,
  Search,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Order {
  id: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const statuses = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận", icon: Clock, bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
    { value: "confirmed", label: "Đã xác nhận", icon: CheckCircle, bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    { value: "shipping", label: "Đang giao", icon: Truck, bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
    { value: "completed", label: "Hoàn thành", icon: CheckCircle, bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    { value: "cancelled", label: "Đã hủy", icon: XCircle, bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      order.id.toString().includes(term) ||
      (order.guest_name?.toLowerCase().includes(term)) ||
      (order.guest_email?.toLowerCase().includes(term)) ||
      (order.guest_phone?.toLowerCase().includes(term))
    );
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // SỬA LẠI HOÀN TOÀN – DÙNG CLASSNAME TRỰC TIẾP, KHÔNG REGEX
  const getStatusClasses = (status: string) => {
    const s = statuses.find(x => x.value === status);
    if (!s || !s.bg) return "bg-gray-100 text-gray-800 border-gray-300";
    return `${s.bg} ${s.text} ${s.border}`;
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(x => x.value === status) || statuses[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <p className="text-sm text-gray-600 mt-1">
                Tổng: <span className="font-bold text-indigo-600">{filteredOrders.length}</span> đơn hàng
              </p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-all text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm ID, tên, email, sđt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900 placeholder-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-600">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">
                              {order.guest_name || "Khách lẻ"}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5">
                              {order.guest_email || order.guest_phone || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {formatVND(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {StatusIcon && <StatusIcon className="w-4 h-4" />}
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusClasses(order.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all`}
                            >
                              {statuses.slice(1).map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}