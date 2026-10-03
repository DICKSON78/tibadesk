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
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->foreignId('medicine_id')->nullable()->after('item_id');
            
            $table->foreign('medicine_id')
                ->references('id')
                ->on('medicines')
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
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->dropForeign(['medicine_id']);
            $table->dropColumn('medicine_id');
        });
    }
};
