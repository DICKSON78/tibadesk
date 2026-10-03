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
        Schema::create('patient_waiting_times', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->timestamp('registration_time')->nullable();
            $table->timestamp('treatment_start_time')->nullable();
            $table->timestamp('treatment_end_time')->nullable();
            $table->integer('waiting_duration_minutes')->nullable(); // Auto-calculated
            $table->integer('treatment_duration_minutes')->nullable(); // Auto-calculated
            $table->string('status')->default('waiting'); // waiting, in_treatment, completed
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['status', 'registration_time']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('patient_waiting_times');
    }
};