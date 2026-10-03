<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalAppointmentsTable extends Migration
{
    public function up()
    {
        Schema::create('dental_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('Assigned dentist');
            $table->dateTime('appointment_date');
            $table->string('appointment_type')->comment('Check-up, Treatment, Follow-up, Emergency');
            $table->string('status')->default('Scheduled')->comment('Scheduled, Confirmed, In Progress, Completed, Cancelled, No Show');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->integer('duration_minutes')->default(30);
            $table->string('chair_number')->nullable();
            $table->boolean('reminder_sent')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['appointment_date', 'status']);
            $table->index(['patient_id', 'appointment_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_appointments');
    }
}
