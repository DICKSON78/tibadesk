<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('ordered')->index();
            $table->string('priority', 20)->default('routine');
            $table->text('clinical_notes')->nullable();
            $table->foreignId('ordered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('ordered_at')->nullable();

            $table->timestamps();

            $table->index(['facility_id', 'encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_orders');
    }
};
