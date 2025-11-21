<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Support\Facades\DB;

class ProductAttributeController extends Controller
{
    /**
     * API: XÓA 1 THUỘC TÍNH KHỎI SẢN PHẨM
     * DELETE /admin/products/{product}/attributes/{attribute}
     */
    public function destroy(Product $product, $attributeId)
    {
        $deleted = ProductAttribute::where('product_id', $product->id)
                                   ->where('attribute_id', $attributeId)
                                   ->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'Xóa thuộc tính thành công'
            ]);
        }

        return response()->json([
            'message' => 'Không tìm thấy thuộc tính này trong sản phẩm'
        ], 404);
    }

    /**
     * API: CẬP NHẬT GIÁ TRỊ CỦA 1 THUỘC TÍNH (dùng khi chỉ muốn sửa 1 field nhanh)
     * PUT /admin/products/{product}/attributes/{attribute}
     */
    public function updateValue(Product $product, $attributeId, Request $request)
    {
        $request->validate([
            'value' => 'nullable|string|max:255'
        ]);

        $updated = ProductAttribute::where('product_id', $product->id)
                                ->where('attribute_id', $attributeId)
                                ->update(['value' => $request->value ?? '']);

        if ($updated) {
            return response()->json([
                'message' => 'Cập nhật giá trị thành công',
                'data' => [
                    'attribute_id' => (int)$attributeId,
                    'value' => $request->value ?? ''
                ]
            ]);
        }

        return response()->json([
            'message' => 'Không tìm thấy thuộc tính hoặc không có thay đổi'
        ], 404);
    }

    /**
     * API: THÊM MỚI 1 THUỘC TÍNH VÀO SẢN PHẨM (nếu cần thêm ngoài danh sách category)
     * POST /admin/products/{product}/attributes
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'nullable|string|max:255'
        ]);

        // Lưu hoặc cập nhật nếu đã tồn tại
        $pa = ProductAttribute::updateOrCreate(
            [
                'product_id' => $product->id,
                'attribute_id' => $request->attribute_id
            ],
            [
                'value' => $request->value ?? ''
            ]
        );

        // Load relationship attribute để frontend hiển thị đúng
        $pa->load('attribute');

        return response()->json([
            'message' => 'Lưu thuộc tính thành công',
            'data' => $pa
        ], 200);
    }

    /**
     * API: LẤY DANH SÁCH THUỘC TÍNH CỦA SẢN PHẨM (dùng cho frontend edit nhanh)
     * GET /admin/products/{product}/attributes
     */
    public function index(Product $product)
    {
        $attributes = $product->attributes()->with('attribute')->get();

        return response()->json([
            'data' => $attributes
        ]);
    }

    /**
     * API: RESET TOÀN BỘ THUỘC TÍNH VỀ RỖNG (value = null) - tiện khi muốn "làm mới"
     * POST /admin/products/{product}/attributes/reset
     */
    public function reset(Product $product)
    {
        ProductAttribute::where('product_id', $product->id)->update(['value' => null]);

        return response()->json([
            'message' => 'Đã reset tất cả giá trị thuộc tính về trống'
        ]);
    }
}