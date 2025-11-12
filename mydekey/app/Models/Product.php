<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str; // ✅ phải ở đây

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'original_price',
        'stock',
        'image',
        'category_id',
        'is_new',
        'is_hot',
        'slug', 
    ];

    protected static function booted()
    {
        static::creating(function ($product) {
            if (!$product->slug) {
                $slug = Str::slug($product->name);
                $count = Product::where('slug', $slug)->count();
                if ($count > 0) {
                    $slug .= '-' . time();
                }
                $product->slug = $slug;
            }
        });

        static::updating(function ($product) {
            if (!$product->slug) {
                $slug = Str::slug($product->name);
                $count = Product::where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->count();
                if ($count > 0) {
                    $slug .= '-' . time();
                }
                $product->slug = $slug;
            }
        });
    }
}
