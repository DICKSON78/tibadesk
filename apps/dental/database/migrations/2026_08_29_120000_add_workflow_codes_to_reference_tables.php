<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add stable machine codes to reference tables so workflow logic can
     * route by ID (code) instead of matching display names. Display names may
     * change in settings; codes are the permanent contract.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('consultation_types', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('name');
            $table->unique('code');
        });

        Schema::table('payment_modes', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('name');
            $table->unique('code');
        });

        Schema::table('payment_channels', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('name');
            $table->unique('code');
        });

        DB::table('consultation_types')->where('name', 'Pharmacy')->update(['code' => 'pharmacy']);
        DB::table('consultation_types')->where('name', 'Dental Lab')->update(['code' => 'dental_lab']);
        DB::table('consultation_types')->where('name', 'Procedure')->update(['code' => 'procedure']);
        DB::table('consultation_types')->where('name', 'Others')->update(['code' => 'others']);
        DB::table('consultation_types')->where('name', 'General Consultation')->update(['code' => 'consultation']);
        DB::table('consultation_types')->where('name', 'Dental')->update(['code' => 'dental']);

        DB::table('payment_modes')->where('name', 'Cash')->update(['code' => 'cash']);
        DB::table('payment_modes')->where('name', 'Credit')->update(['code' => 'credit']);

        DB::table('payment_channels')->where('name', 'Cash')->update(['code' => 'cash']);
        DB::table('payment_channels')->where('name', 'Credit')->update(['code' => 'credit']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('consultation_types', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });

        Schema::table('payment_modes', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });

        Schema::table('payment_channels', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });
    }
};