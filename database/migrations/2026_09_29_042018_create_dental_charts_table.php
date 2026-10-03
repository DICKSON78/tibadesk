<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dental_charts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            // FDI notation: 11 is the upper right central incisor.
            $table->unsignedTinyInteger('tooth_number');
            // Which surfaces are affected, as a set of codes (m, o, i, d, b, f).
            $table->json('surfaces')->nullable();
            $table->string('condition', 40)->default('healthy');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('recorded_at')->nullable();

            $table->timestamps();

            // One row per tooth per visit, so a later chart is history.
            $table->unique(['facility_id', 'encounter_id', 'tooth_number'], 'dental_chart_tooth_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dental_charts');
    }
};
