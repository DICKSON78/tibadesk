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
        Schema::create('stocktake_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stocktake_id');
            $table->foreignId('item_id');
            $table->double('quantity')->unsigned();
            $table->double('unit_buying_price')->unsigned()->nullable();
            $table->double('selling_price')->unsigned()->nullable();
            $table->date('expiration_date')->nullable();
            $table->timestamps();

            $table->foreign('stocktake_id')
                ->references('id')
                ->on('stocktakes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('item_id')
                ->references('id')
                ->on('items')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stocktake_items');
    }
};
