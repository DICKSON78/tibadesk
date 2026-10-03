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
        Schema::table('doctor_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('consultation_id')->nullable()->after('patient_id');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
            $table->index('consultation_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('doctor_tasks', function (Blueprint $table) {
            $table->dropForeign(['consultation_id']);
            $table->dropIndex(['consultation_id']);
            $table->dropColumn('consultation_id');
        });
    }
};
