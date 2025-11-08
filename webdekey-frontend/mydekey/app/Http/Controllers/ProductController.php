<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    //Dữ liệu demo
    private $products = [
        ['id' => 1, 'name' => 'Product A', 'price' => 100],
        ['id' => 2, 'name' => 'Product B', 'price' => 200],
        ['id' => 3, 'name' => 'Product C', 'price' => 300],
    ];

    //Lấy tất cả sản phẩm
    public function index(){
        return response()->json($this->products);
    }

    //Lấy chi tiết sản phẩm theo ID
    public function show($id){
        foreach ($this->products as $product){
            if ($product['id'] == (int)$id){
                return response()->json($product);
            }
        }
        return response()->json(['message' => 'Product not found'], 404);
    }
}
