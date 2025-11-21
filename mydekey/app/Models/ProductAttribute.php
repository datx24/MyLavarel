<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'attribute_id', 'value'];

    // Relationship với bảng attributes
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }

    // Relationship với bảng products nếu cần
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
