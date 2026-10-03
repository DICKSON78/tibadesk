<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('edition');
            $table->unsignedInteger('amount');
            $table->string('currency', 8)->default('TZS');
            $table->string('status')->index();

            $table->string('customer_name');
            $table->string('email');
            $table->string('phone');
            $table->string('facility_name');
            $table->string('tin')->nullable();

            $table->string('payment_reference')->nullable()->index();
            $table->string('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('period_start')->nullable();
            $table->timestamp('period_end')->nullable();
            $table->timestamp('licence_issued_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_orders');
    }
};
