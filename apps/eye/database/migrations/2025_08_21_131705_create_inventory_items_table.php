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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->foreignId('item_type_id')->nullable();
            $table->foreignId('unit_of_measure_id')->nullable();
            $table->double('balance')->default(0);
            $table->double('new_balance')->nullable();
            $table->double('unit_buying_price')->unsigned()->nullable();
            $table->double('selling_price')->unsigned()->nullable();
            $table->date('expiry_date')->nullable();
            $table->double('minimum_stock')->default(0);
            $table->enum('has_expiry', ['Yes', 'No'])->default('No');
            $table->string('supplier')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('item_type_id')
                ->references('id')
                ->on('item_types')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('unit_of_measure_id')
                ->references('id')
                ->on('units_of_measure')
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
        Schema::dropIfExists('inventory_items');
    }
};
