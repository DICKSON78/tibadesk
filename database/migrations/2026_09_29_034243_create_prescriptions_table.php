<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

            // Name is kept as typed even once the pharmacy catalogue links,
            // because a generic must remain readable on the printed slip.
            $table->string('medicine');
            $table->string('dose')->nullable();
            $table->string('route', 40)->nullable();
            $table->string('frequency', 80)->nullable();
            $table->string('duration', 80)->nullable();
            $table->text('instructions')->nullable();

            $table->unsignedInteger('quantity')->default(1);

            $table->enum('status', ['pending', 'dispensed', 'cancelled'])
                ->default('pending')
                ->index();

            $table->foreignId('prescribed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dispensed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('dispensed_at')->nullable();

            $table->timestamps();

            $table->index(['facility_id', 'consultation_id']);
            $table->index(['facility_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
