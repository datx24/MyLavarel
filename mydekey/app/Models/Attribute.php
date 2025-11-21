<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductAttribute;

class Attribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'unit',
    ];

    // Quan hệ nhiều - 1 với Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // App/Models/Attribute.php
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attributes')
                    ->withPivot('value')
                    ->withTimestamps();
    }
}
