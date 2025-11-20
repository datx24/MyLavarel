<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
