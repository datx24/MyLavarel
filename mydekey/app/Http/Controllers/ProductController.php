<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;

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

    /**
     * LẤY DANH SÁCH SẢN PHẨM THEO SLUG DANH MỤC
     * URL: GET /api/products/category/dien-thoai
     */
    public function showSlug($slug, Request $request)
    {
        // Tìm danh mục theo slug
        $category = Category::where('slug', $slug)->first();

        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại'
            ], 404);
        }

        // Query sản phẩm
        $perPage = $request->get('per_page', 20);
        $search = $request->get('search', '');
        $sort = $request->get('sort', 'latest');

        $query = Product::where('category_id', $category->id);

        // Tìm kiếm
        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        // Sắp xếp
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
            'filters' => [
                'search' => $search,
                'sort' => $sort,
            ]
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if ($query) {
            $products = Product::where('name', 'LIKE', "%{$query}%")
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        } else {
            // Nếu query rỗng, lấy 5 sản phẩm mới nhất
            $products = Product::orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        }

        $result = $products->map(function($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'image' => $p->image ? asset('storage/' . $p->image) : null,
                'price' => $p->price,
            ];
        });

        return response()->json($result);
    }

    /**
     * Hiển thị chi tiết sản phẩm theo slug
     * URL: GET /api/products/slug/{slug}
     */
    public function showBySlug($slug)
    {
        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại'
            ], 404);
        }

        return response()->json($product);
    }
}

