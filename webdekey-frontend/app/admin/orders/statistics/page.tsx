"use client";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Loader2,
  Calendar,
  User,
  RefreshCw,
  Calendar as CalendarIcon
} from "lucide-react";

interface Order {
  id: number;
  customer_name?: string | null;
  total_amount: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

interface Statistics {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  recent_orders: Order[];
  dateRange: string;
}

export default function OrderStatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // State cho khoảng thời gian
  const [startDate, setStartDate] = useState<string>(
    format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // Fetch toàn bộ đơn hàng 1 lần
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const metaRes = await api.get("/admin/orders?per_page=1");
      const totalItems = metaRes.data.total || 0;
      const perPage = 100;
      const totalPages = Math.ceil(totalItems / perPage);

      const orders: Order[] = [];
      for (let page = 1; page <= totalPages; page++) {
        const res = await api.get(`/admin/orders?per_page=${perPage}&page=${page}`);
        orders.push(...res.data.data);
      }

      setAllOrders(orders);
      computeStats(orders, startDate, endDate);
    } catch (error) {
      console.error("Lỗi fetch orders:", error);
      setAllOrders([]);
      setStats({
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        recent_orders: [],
        dateRange: "Không có dữ liệu"
      });
    } finally {
      setLoading(false);
    }
  };

  // Tính toán lại khi đổi ngày
  const computeStats = (orders: Order[], from: string, to: string) => {
    const fromDate = startOfDay(new Date(from));
    const toDate = endOfDay(new Date(to));

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return isWithinInterval(orderDate, { start: fromDate, end: toDate });
    });

    const total_revenue = filtered.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    const recent_orders = filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    const dateRange = `${format(fromDate, "dd/MM")} → ${format(toDate, "dd/MM/yyyy")}`;

    setStats({
      total_orders: filtered.length,
      total_revenue: Math.round(total_revenue),
      pending_orders: filtered.filter(o => o.status === "pending").length,
      completed_orders: filtered.filter(o => o.status === "completed").length,
      cancelled_orders: filtered.filter(o => o.status === "cancelled").length,
      recent_orders,
      dateRange
    });
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (allOrders.length > 0) {
      computeStats(allOrders, startDate, endDate);
    }
  }, [startDate, endDate, allOrders]);

  const handleRefresh = () => {
    fetchAllOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Đang tải toàn bộ đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header + Date Picker + Refresh */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                  Thống kê đơn hàng
                </h1>
                <p className="text-lg text-indigo-600 font-semibold">
                  Doanh thu: {(stats?.total_revenue ?? 0).toLocaleString()}đ
                  <span className="text-slate-600 text-sm font-normal ml-2">
                    ({stats?.dateRange})
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Từ ngày */}
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-black pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <span className="text-slate-500">→</span>

                {/* Đến ngày */}
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="text-black pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleRefresh}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { icon: Package, label: "Tổng đơn hàng", value: stats?.total_orders ?? 0, color: "indigo" },
              { icon: DollarSign, label: "Tổng doanh thu", value: `${(stats?.total_revenue ?? 0).toLocaleString()}đ`, color: "emerald" },
              { icon: Clock, label: "Đơn chờ xác nhận", value: stats?.pending_orders ?? 0, color: "amber" },
              { icon: CheckCircle2, label: "Đơn hoàn thành", value: stats?.completed_orders ?? 0, color: "emerald" },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500 to-${item.color === 'indigo' ? 'purple' : item.color === 'emerald' ? 'teal' : 'orange'}-600 opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-${item.color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                    </div>
                    {i === 0 && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {i === 1 && <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>}
                  </div>
                  <p className="text-slate-600 text-sm font-medium">{item.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                Đơn hàng gần đây ({stats?.dateRange})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Khách</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recent_orders ?? []).length > 0 ? (
                    stats!.recent_orders!.map((order, i) => (
                      <tr key={order.id} className="hover:bg-indigo-50/50 transition-all">
                        <td className="px-6 py-5 font-medium text-slate-900">#{order.id}</td>
                        <td className="px-6 py-5 text-slate-700">
                          {order.customer_name || <span className="text-slate-500 italic">Khách lẻ</span>}
                        </td>
                        <td className="px-6 py-5 font-semibold text-slate-800">
                          {parseFloat(order.total_amount).toLocaleString()}đ
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            order.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                            order.status === "completed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            "bg-rose-100 text-rose-800 border-rose-200"
                          }`}>
                            {order.status === "pending" && <Clock className="w-4 h-4" />}
                            {order.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                            {order.status === "cancelled" && <XCircle className="w-4 h-4" />}
                            {order.status === "pending" ? "Đang chờ" : order.status === "completed" ? "Hoàn thành" : "Hủy"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm">
                          {format(new Date(order.created_at), "dd/MM HH:mm")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Không có đơn hàng trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 text-center text-slate-500 text-sm">
            Cập nhật: {format(new Date(), "HH:mm, d MMMM yyyy", { locale: vi })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </>
  );
}