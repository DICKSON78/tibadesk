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
        Schema::create('patient_payment_cache_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_id');
            $table->foreignId('item_id');
            $table->foreignId('consultation_type_id');
            $table->foreignId('consultant_id')->nullable();
            $table->foreignId('payment_mode_id');
            $table->double('unit_price')->unsigned();
            $table->double('quantity')->unsigned();
            $table->foreignId('item_payment_id')->nullable();
            $table->foreignId('bill_id')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->text('dosage')->nullable();
            $table->text('comments')->nullable();
            $table->enum('status', ['Pending', 'Paid', 'Billed', 'Served'])->default('Pending');
            $table->dateTime('served_at')->nullable();
            $table->foreignId('served_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('payment_cache_id')
                ->references('id')
                ->on('patient_payment_cache')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('item_id')
                ->references('id')
                ->on('items')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('consultation_type_id')
                ->references('id')
                ->on('consultation_types')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('consultant_id')
                ->references('id')
                ->on('employees')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('payment_mode_id')
                ->references('id')
                ->on('payment_modes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('served_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('patient_payment_cache_items');
    }
};
