<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller; 
use Illuminate\Http\Request;
use App\Models\Attribute; 

class AttributeController extends Controller
{
    //Hiển thị danh sách attribute theo category_id
    public function index() {
        $attributes = Attribute::with('category')->get();
        return response()->json($attributes);
    }
    
    // Thêm attribute mới
    public function store(Request $request) {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50',
        ]);

        $attribute = Attribute::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'unit' => $request->unit,
        ]);

        return response()->json([
            'message' => 'Tạo attribute thành công',
            'attribute' => $attribute->load('category')
        ]);
    }

    // Cập nhật attribute
    public function update(Request $request, $id) {
        $attribute = Attribute::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50',
        ]);

        $attribute->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'unit' => $request->unit,
        ]);

        return response()->json([
            'message' => 'Cập nhật attribute thành công',
            'attribute' => $attribute->load('category')
        ]);
    }

    // Xóa attribute
    public function destroy($id) {
        $attribute = Attribute::findOrFail($id);
        $attribute->delete();

        return response()->json([
            'message' => 'Xóa attribute thành công'
        ]);
    }
}
