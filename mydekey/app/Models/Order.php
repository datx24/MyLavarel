<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_gender',
        'province',
        'district',
        'ward',
        'street',
        'note',
        'need_invoice',
        'company_name',
        'tax_code',
        'company_address',
        'payment_method',
        'shipping_fee',
        'discount_amount',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'need_invoice' => 'boolean',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Quan hệ với OrderItem
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Quan hệ với User (có thể null)
    public function user()
    {
        return $this->belongsTo(User::class)->withDefault();
    }

    // Tự động tạo mã đơn đẹp: DEKEY000001
    public function getOrderCodeAttribute()
    {
        return 'DEKEY' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }
}