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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->foreignId('item_type_id')->nullable();
            $table->foreignId('consultation_type_id')->nullable();
            $table->foreignId('unit_of_measure_id')->nullable();
            $table->foreignId('lens_type_id')->nullable();
            $table->enum('is_consultation_item', ['Yes', 'No'])->default('No');
            $table->enum('is_stock_item', ['Yes', 'No'])->default('No');
            $table->double('balance')->nullable();
            $table->double('unit_buying_price')->unsigned()->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('item_type_id')
                ->references('id')
                ->on('item_types')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('consultation_type_id')
                ->references('id')
                ->on('consultation_types')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('unit_of_measure_id')
                ->references('id')
                ->on('units_of_measure')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('lens_type_id')
                ->references('id')
                ->on('lens_types')
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
        Schema::dropIfExists('items');
    }
};
