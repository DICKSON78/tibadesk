<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table): void {
            $table->id();

            // The tenant key. Present on the patient itself, not inferred
            // through whoever created the record, so a patient's data can
            // never leak into a facility that did not register them.
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();

            // Printed on every patient document, so uniqueness is per facility:
            // two hospitals may both issue P-000001 without colliding.
            $table->string('patient_number', 32);

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();

            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();

            // The national id of whoever is financially responsible, kept off
            // the patient row because a child patient has no such thing.
            $table->string('next_of_kin_name')->nullable();
            $table->string('next_of_kin_phone', 40)->nullable();
            $table->string('next_of_kin_relationship', 60)->nullable();

            $table->text('notes')->nullable();
            $table->boolean('is_deceased')->default(false);
            $table->dateTime('deceased_at')->nullable();

            $table->foreignId('registered_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            $table->unique(['facility_id', 'patient_number']);
            $table->index(['facility_id', 'last_name', 'first_name']);
            $table->index(['facility_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
