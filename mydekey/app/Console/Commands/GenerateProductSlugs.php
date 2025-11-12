<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Str;

class GenerateProductSlugs extends Command
{
    protected $signature = 'products:generate-slugs';
    protected $description = 'Generate slugs for existing products';

    public function handle()
    {
        $products = Product::all();
        foreach ($products as $product) {
            // Tạo slug từ name
            $slug = Str::slug($product->name);

            // Kiểm tra slug trùng, nếu trùng thì thêm id vào
            $exists = Product::where('slug', $slug)->exists();
            if ($exists) {
                $slug .= '-' . $product->id;
            }

            $product->slug = $slug;
            $product->save();

            $this->info("Updated product {$product->id} => {$slug}");
        }

        $this->info("All product slugs generated!");
    }
}
