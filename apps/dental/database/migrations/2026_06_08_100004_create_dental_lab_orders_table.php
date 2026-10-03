<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalLabOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('dental_lab_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->foreignId('payment_cache_item_id')->nullable()->constrained('patient_payment_cache_items')->nullOnDelete();
            $table->string('order_type')->comment('Crown, Bridge, Denture, Veneer, etc.');
            $table->text('description')->nullable();
            $table->string('material')->nullable();
            $table->string('shade')->nullable();
            $table->integer('tooth_number')->nullable();
            $table->json('teeth_involved')->nullable();
            $table->date('impression_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->date('insertion_date')->nullable();
            $table->string('status')->default('Ordered')->comment('Ordered, In Progress, Ready, Delivered, Inserted');
            $table->text('lab_notes')->nullable();
            $table->string('lab_name')->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->foreignId('ordered_by')->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_lab_orders');
    }
}
