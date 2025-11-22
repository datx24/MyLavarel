<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\Attribute;           // ← Thêm dòng này
use App\Models\ProductAttribute;     // đã có (để dùng trong quan hệ)

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'sub_images',
        'category_id',
        'is_new',
        'is_hot',
        'slug',
    ];

    protected $casts = [
        'sub_images' => 'array'
    ];

    protected static function booted()
    {
        // === SLUG HIỆN TẠI CỦA BẠN (giữ nguyên) ===
        static::creating(function ($product) {
            if (!$product->slug) {
                $slug = Str::slug($product->name);
                $originalSlug = $slug;
                $count = Product::where('slug', $slug)->count();
                if ($count > 0) {
                    $slug = $originalSlug . '-' . time();
                }
                $product->slug = $slug;
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') || !$product->slug) {
                $slug = Str::slug($product->name);
                $originalSlug = $slug;
                $count = Product::where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->count();
                if ($count > 0) {
                    $slug = $originalSlug . '-' . time();
                }
                $product->slug = $slug;
            }
        });

        // ==================== TỰ ĐỘNG ĐỒNG BỘ ATTRIBUTES ====================
        // Khi tạo mới sản phẩm → tự động tạo các product_attributes (value = null)
        static::created(function ($product) {
            $product->syncAttributesFromCategory();
        });

        // Khi cập nhật và category_id thay đổi → xóa hết cũ, tạo lại theo category mới
        static::updated(function ($product) {
            if ($product->isDirty('category_id')) {
                $product->syncAttributesFromCategory();
            }
        });
    }

    // Quan hệ với Category
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Quan hệ với ProductAttribute
    // App/Models/Product.php
    // Lấy tất cả attributes của sản phẩm
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class, 'product_id');
    }

    /**
     * Đồng bộ attributes theo category hiện tại
     * - Xóa hết product_attributes cũ
     * - Tạo mới theo danh sách attribute của category (value = null)
     */
    public function syncAttributesFromCategory(): void
    {
        if (!$this->category_id) {
            // Xóa hết pivot cũ
            ProductAttribute::where('product_id', $this->id)->delete();
            return;
        }

        $attributeIds = Attribute::where('category_id', $this->category_id)
            ->pluck('id')
            ->toArray();

        // Xóa pivot cũ
        ProductAttribute::where('product_id', $this->id)->delete();

        // Tạo mới
        $insertData = [];
        foreach ($attributeIds as $attributeId) {
            $insertData[] = [
                'product_id'   => $this->id,
                'attribute_id' => $attributeId,
                'value'        => null,
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        if (!empty($insertData)) {
            ProductAttribute::insert($insertData);
        }
    }
}