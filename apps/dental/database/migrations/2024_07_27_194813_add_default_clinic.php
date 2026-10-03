<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        $table_names = ['departments', 'users', 'expense_categories', 'information_sources', 'items', 'job_titles', 'payment_channels', 'payment_modes', 'preferences'];

        try {
            foreach ($table_names as $table_name) {
                DB::statement(sprintf('update %s set clinic_id = ?', $table_name), [1]);
            }
        } catch (\Exception $e) {
            // ignore
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
