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
        Schema::table('items', function (Blueprint $table) {
            $table->date('expiry_date')->nullable()->after('unit_buying_price');
            $table->double('minimum_stock')->default(0)->after('expiry_date');
            $table->enum('has_expiry', ['Yes', 'No'])->default('No')->after('minimum_stock');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['expiry_date', 'minimum_stock', 'has_expiry']);
        });
    }
};
