<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index() {
        return response()->json(Product::all());
    }

    public function show($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message'=> 'Not Found'], 404);
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        // Chuyển các giá trị boolean và số từ FormData về đúng kiểu
        $request->merge([
            'is_new' => $request->input('is_new') === "1",
            'is_hot' => $request->input('is_hot') === "1",
            'price' => (float) $request->input('price'),
            'original_price' => $request->input('original_price') ? (float) $request->input('original_price') : null,
            'stock' => (int) $request->input('stock'),
            'category_id' => (int) $request->input('category_id'),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'original_price' => 'nullable|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,gif,webp|max:2048',
            'is_new' => 'boolean',
            'is_hot' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);

        $request->merge([
            'is_new' => $request->input('is_new') === "1",
            'is_hot' => $request->input('is_hot') === "1",
            'price' => (float) $request->input('price'),
            'original_price' => $request->input('original_price') ? (float) $request->input('original_price') : null,
            'stock' => (int) $request->input('stock'),
            'category_id' => (int) $request->input('category_id'),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'original_price' => 'nullable|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,gif,webp|max:2048',
            'is_new' => 'boolean',
            'is_hot' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        $product->delete();
        return response()->json(['message' => 'Deleted'], 204);
    }
}

