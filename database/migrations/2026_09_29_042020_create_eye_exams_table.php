<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eye_exams', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            // Right eye / left eye, kept as separate columns because a
            // refraction that reads as a pair is easy to transpose.
            $table->string('od_visual_acuity', 20)->nullable();
            $table->string('os_visual_acuity', 20)->nullable();
            $table->decimal('od_sphere', 6, 2)->nullable();
            $table->decimal('od_cylinder', 6, 2)->nullable();
            $table->decimal('od_axis', 6, 2)->nullable();
            $table->decimal('os_sphere', 6, 2)->nullable();
            $table->decimal('os_cylinder', 6, 2)->nullable();
            $table->decimal('os_axis', 6, 2)->nullable();
            $table->decimal('od_iop', 5, 2)->nullable();
            $table->decimal('os_iop', 5, 2)->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('recorded_at')->nullable();

            $table->timestamps();

            $table->index(['facility_id', 'encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eye_exams');
    }
};
