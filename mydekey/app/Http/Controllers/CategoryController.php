<?php

namespace App\Http\Controllers;

use App\Models\category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json(Category::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //Kiểm tra dữ liệu đầu vào
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'slug' => 'nullable|string',
        ]);
        //Tạo mới danh mục
        $category = Category::create($validated );
        return response()->json(['message' => 'Tạo danh mục thành công', 'data' => $category], 201);
    }

    /**
     * Hiển thị thông tin 1 category cụ thể
     */
    public function show($id)
    {
        $category = Category::find($id);
        if(!$category){
            return response()->json(['message' => 'Danh mục không tồn tại'], 404);
        }
        return response()->json($category, 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\category  $category
     * @return \Illuminate\Http\Response
     */
    public function edit(category $category)
    {
        //
    }

    /**
     * Cập nhật thông tin danh mục
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if(!$category){
            return response()->json(['message' => 'Danh mục không tồn tại'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$id,
            'description' => 'nullable|string',
            'slug' => 'nullable|string',
        ]);

        $category ->update($validated);
        return response()->json(['message' => 'Cập nhật danh mục thành công', 'data' => $category], 200);
    }

    /**
     * Xóa danh mục
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if(!$category){
            return response()->json(['message' => 'Danh mục không tồn tại'], 404);
        }   

        $category->delete();

        return response()->json(['message' => 'Xóa danh mục thành công'], 200);
    }
}
