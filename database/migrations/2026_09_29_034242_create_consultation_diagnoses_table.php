<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_diagnoses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();

            // Free text rather than a coded disease table. TibaDesk serves
            // dental, eye, polyclinic and hospital facilities, and a code set
            // that covers all of them is a reporting decision, not a schema one.
            $table->string('description');
            $table->string('code', 32)->nullable();

            // A principal diagnosis is what the visit is billed and reported
            // under, so the database allows at most one per consultation.
            $table->enum('type', ['preliminary', 'principal', 'additional'])
                ->default('preliminary');

            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['facility_id', 'consultation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_diagnoses');
    }
};
