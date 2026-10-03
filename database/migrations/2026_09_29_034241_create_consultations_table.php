<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained()->cascadeOnDelete();

            $table->string('consultation_number', 32);

            // A draft is the clinician still typing; a completed consultation
            // is signed off and no longer editable by anyone but a facility
            // admin.
            $table->enum('status', ['draft', 'completed', 'cancelled'])
                ->default('draft')
                ->index();

            $table->string('chief_complaint')->nullable();
            $table->text('history_present_illness')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('drug_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('allergy_history')->nullable();
            $table->text('general_health')->nullable();

            $table->text('examination')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->text('plan')->nullable();
            $table->text('remarks')->nullable();

            $table->foreignId('clinician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('completed_at')->nullable();

            $table->timestamps();

            $table->unique(['facility_id', 'consultation_number']);

            // One consultation per encounter. The clinical core treats a visit
            // as a single clinical assessment, so the database refuses the
            // duplicate that would otherwise double-charge and double-count.
            $table->unique('encounter_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
