<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuestOrderController extends Controller
{
    public function storeGuest(Request $request)
{
    $request->validate([
        'customer_name'     => 'required|string|max:255',
        'customer_phone'    => ['required', 'regex:/^0[3|5|7|8|9]\d{8}$/'],
        'customer_email'    => 'nullable|email',
        'customer_gender'   => 'required|in:anh,chi,other',
        'province'          => 'required|string',
        'district'          => 'required|string',
        'ward'              => 'required|string',
        'street'            => 'required|string',
        'note'              => 'nullable|string',
        'need_invoice'      => 'boolean',
        'payment_method'    => 'required|in:cod,bank,momo,vnpay',
        'items'             => 'required|array|min:1',
        'items.*.product_id'=> 'required|exists:products,id',
        'items.*.quantity'  => 'required|integer|min:1',
    ]);

    DB::beginTransaction();
    try {
        $subtotal = 0;
        $orderItems = [];

        foreach ($request->items as $item) {
            $product = \App\Models\Product::find($item['product_id']);

            // CHỐNG HACK: GIÁ LẤY TỪ DB, KHÔNG TIN FRONTEND
            $price = $product->price; // hoặc $product->sale_price nếu có
            $qty   = $item['quantity'];

            // Kiểm tra tồn kho
            if ($product->stock < $qty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm ' . $product->name . ' không đủ tồn kho. Tồn kho hiện tại: ' . $product->stock
                ], 400);
            }

            $subtotal += $price * $qty;

            $orderItems[] = [
                'product_id' => $product->id,
                'quantity'   => $qty,
                'price'      => $price, // giá thật từ DB
            ];
        }

        $shipping_fee = 30000;
        $total = $subtotal + $shipping_fee;

        $order = Order::create([
            'user_id'         => null,
            'customer_name'   => $request->customer_name,
            'customer_phone'  => $request->customer_phone,
            'customer_email'  => $request->customer_email,
            'customer_gender' => $request->customer_gender,
            'province'        => $request->province,
            'district'        => $request->district,
            'ward'            => $request->ward,
            'street'          => $request->street,
            'note'            => $request->note,
            'need_invoice'    => $request->need_invoice ?? false,
            'payment_method'  => $request->payment_method,
            'shipping_fee'    => $shipping_fee,
            'total_amount'    => $total,
            'status'          => 'pending',
        ]);

        foreach ($orderItems as $i) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $i['product_id'],
                'quantity'   => $i['quantity'],
                'price'      => $i['price'],
            ]);

            // Giảm tồn kho
            $product = \App\Models\Product::find($i['product_id']);
            $product->decrement('stock', $i['quantity']);
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Đặt hàng thành công!',
            'order'   => [
                'id'    => $order->id,
                'code'  => $order->order_code,
                'total' => number_format($total) . 'đ'
            ]
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Guest Order Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Lỗi hệ thống, vui lòng thử lại!'
        ], 500);
    }
}
}