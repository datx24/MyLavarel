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
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'original_price' => 'nullable|numeric',
            'stock' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,gif',
            'is_new' => 'nullable|boolean',
            'is_hot' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        } else {
            $imagePath = null;
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'original_price' => $request->original_price,
            'stock' => $request->stock,
            'category_id' => $request->category_id,
            'image' => $imagePath,
            'is_new' => $request->is_new ?? false,
            'is_hot' => $request->is_hot ?? false,
        ]);

        return response()->json($product, 201);
    }

   public function update(Request $request, $id) {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        $product->update($request->only(['name', 'description', 'price', 'stock', 'image', 'category_id']));
        return response()->json($product);
    }

    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        $product->delete();
        return response()->json(['message' => 'Deleted'], 204);
    }
}
