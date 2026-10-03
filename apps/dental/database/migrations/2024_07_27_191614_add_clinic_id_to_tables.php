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
        DB::statement('rename table clinic_details to clinics');

        Schema::table('clinics', function (Blueprint $table) {
            $table->string('sms_key')->nullable()->after('sms_balance');
            $table->string('logo')->nullable()->after('sms_key');
        });

        $sms_key = env('SMS_KEY');
        if ($sms_key) {
            DB::statement('update clinics set sms_key = ?', [env('SMS_KEY')]);
        }

        // DB::statement('alter table preferences drop primary key');

        Schema::table('preferences', function (Blueprint $table) {
            $table->dropPrimary();
        });
        Schema::table('preferences', function (Blueprint $table) {
            $table->id()->autoIncrement()->first();
        });

        $table_names = ['departments', 'users', 'expense_categories', 'information_sources', 'items', 'job_titles', 'payment_channels', 'payment_modes', 'preferences'];

        foreach ($table_names as $table_name) {
            Schema::table($table_name, function (Blueprint $table) {
                $table->foreignId('clinic_id')->nullable()->after('id');

                $table->foreign('clinic_id')
                    ->references('id')
                    ->on('clinics')
                    ->cascadeOnUpdate()
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
