<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encounters', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

            // Printed on the visit slip and on the invoice.
            $table->string('encounter_number', 32);

            $table->enum('type', ['opd', 'inpatient', 'emergency', 'day_case', 'home_visit'])
                ->default('opd');

            $table->enum('status', ['registered', 'in_progress', 'completed', 'cancelled'])
                ->default('registered')
                ->index();

            $table->enum('payment_mode', ['cash', 'insurance', 'credit', 'mobile_money', 'bank_transfer', 'card'])
                ->default('cash');

            $table->string('reason_for_visit')->nullable();
            $table->string('department')->nullable();
            $table->string('referred_by')->nullable();

            $table->foreignId('clinician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();

            $table->dateTime('registered_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();

            $table->timestamps();

            $table->unique(['facility_id', 'encounter_number']);
            $table->index(['facility_id', 'status', 'registered_at']);
            $table->index(['facility_id', 'clinician_id', 'registered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encounters');
    }
};
