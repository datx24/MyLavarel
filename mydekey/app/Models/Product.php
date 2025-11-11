<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    // Các cột có thể gán giá trị hàng loạt
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
    ];
}
