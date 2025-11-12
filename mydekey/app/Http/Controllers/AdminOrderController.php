<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'user']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search by order code or customer name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Sort by created_at desc by default
        $orders = $query->orderBy('created_at', 'desc')
                        ->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'user'])->findOrFail($id);

        return response()->json([
            'id' => $order->id,
            'order_code' => $order->order_code,
            'user_id' => $order->user_id,
            'guest_name' => $order->customer_name,
            'guest_email' => $order->customer_email,
            'guest_phone' => $order->customer_phone,
            'guest_address' => $order->province . ', ' . $order->district . ', ' . $order->ward . ', ' . $order->street,
            'total' => $order->total_amount,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'product' => [
                        'name' => $item->product->name,
                        'image' => $item->product->image,
                    ],
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,shipping,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công!',
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,shipping,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công!',
        ]);
    }

    public function statistics()
    {
        $totalOrders     = Order::count();
        $totalRevenue    = Order::sum('total_amount');
        
        // Dựa vào updated_at
        $todayOrders     = Order::whereDate('updated_at', today())->count();
        $todayRevenue    = Order::whereDate('updated_at', today())->sum('total_amount');
        
        $pendingOrders   = Order::where('status', 'pending')->count();
        $confirmedOrders = Order::where('status', 'confirmed')->count();
        $shippingOrders  = Order::where('status', 'shipping')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $guestOrders     = Order::whereNull('user_id')->count();

        $ordersByStatus = [
            'pending'    => $pendingOrders,
            'confirmed'  => $confirmedOrders,
            'shipping'   => $shippingOrders,
            'completed'  => $completedOrders,
            'cancelled'  => $cancelledOrders,
        ];

        return response()->json([
            'total_orders'       => $totalOrders,
            'total_revenue'      => (float) $totalRevenue,
            'today_orders'       => $todayOrders,
            'today_revenue'      => (float) $todayRevenue,
            'pending_orders'     => $pendingOrders,
            'confirmed_orders'   => $confirmedOrders,
            'shipping_orders'    => $shippingOrders,
            'completed_orders'   => $completedOrders,
            'cancelled_orders'   => $cancelledOrders,
            'guest_orders'       => $guestOrders,
            'orders_by_status'   => $ordersByStatus,
            'updated_at'         => now()->toDateTimeString(),
        ]);
    }
}
