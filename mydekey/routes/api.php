<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GuestOrderController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\ProductAttributeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);

Route::post('guest-orders', [GuestOrderController::class, 'storeGuest']);

// Admin routes (no auth required for now)
Route::prefix('admin')->group(function () {
    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::get('orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('orders/{id}', [AdminOrderController::class, 'update']);
    Route::put('orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::get('orders/statistics', [AdminOrderController::class, 'statistics']);
});

Route::get('/products/category/{slug}', [ProductController::class, 'showSlug']);
Route::get('products/category/{slug}/price-range', [ProductController::class, 'getPriceRange']);

// Admin routes (no auth required for now)
Route::prefix('admin')->group(function () {
    Route::apiResource('attributes', AttributeController::class);
    Route::get('/attributes-by-category/{category_id}', [AttributeController::class, 'getByCategory']);
});

// routes/api.php hoặc routes/web.php trong group admin
Route::prefix('admin/products/{product}/attributes')->group(function () {
    Route::get('/', [ProductAttributeController::class, 'index']);
    Route::post('/', [ProductAttributeController::class, 'store']);
    Route::delete('/{attribute}', [ProductAttributeController::class, 'destroy']);
    Route::put('/{attribute}', [ProductAttributeController::class, 'updateValue']);
    Route::post('/reset', [ProductAttributeController::class, 'reset']);
});





