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
        // Guarded per column. A database created before this migration existed
        // already carries both columns under the same names, and an unguarded
        // ALTER aborts the entire batch rather than adding what is genuinely
        // missing. Per column rather than per table, so a partially migrated
        // database still ends up correct.
        $existing = Schema::getColumnListing('stocktake_items');

        Schema::table('stocktake_items', function (Blueprint $table) use ($existing) {
            if (! in_array('selling_price', $existing, true)) {
                $table->double('selling_price')->unsigned()->nullable()->after('unit_buying_price');
            }

            if (! in_array('expiration_date', $existing, true)) {
                $table->date('expiration_date')->nullable()->after('selling_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('stocktake_items', function (Blueprint $table) {
            $table->dropColumn(['selling_price', 'expiration_date']);
        });
    }
};
