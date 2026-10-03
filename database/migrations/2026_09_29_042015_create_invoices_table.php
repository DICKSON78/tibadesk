<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number', 40);
            $table->string('status', 20)->default('unpaid')->index();
            $table->unsignedInteger('subtotal')->default(0);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('total')->default(0);
            $table->unsignedInteger('amount_paid')->default(0);

            $table->timestamps();

            $table->unique(['facility_id', 'invoice_number']);
            $table->index(['facility_id', 'encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
