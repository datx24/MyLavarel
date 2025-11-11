<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->enum('customer_gender', ['anh', 'chi', 'other'])->default('other');
            
            $table->string('province');
            $table->string('district');
            $table->string('ward');
            $table->string('street');
            $table->text('note')->nullable();
            
            $table->boolean('need_invoice')->default(false);
            $table->string('company_name')->nullable();
            $table->string('tax_code')->nullable();
            $table->string('company_address')->nullable();
            
            $table->string('payment_method')->default('cod'); // cod, bank, momo, vnpay
            $table->decimal('shipping_fee', 10, 2)->default(30000);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            
            $table->enum('status', ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'])
                ->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
