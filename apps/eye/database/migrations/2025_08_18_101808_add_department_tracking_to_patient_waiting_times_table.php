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
        Schema::table('patient_waiting_times', function (Blueprint $table) {
            $table->string('current_department')->nullable()->after('doctor_id');
            $table->json('department_history')->nullable()->after('current_department');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patient_waiting_times', function (Blueprint $table) {
            $table->dropColumn(['current_department', 'department_history']);
        });
    }
};
