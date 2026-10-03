<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encounter_referrals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('encounters')->cascadeOnDelete();
            $table->foreignId('from_department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('to_department_id')->constrained('departments')->cascadeOnDelete();
            $table->text('reason');
            $table->string('status', 20)->default('pending')->index();
            $table->foreignId('referred_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('referred_at')->nullable();
            $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('accepted_at')->nullable();

            $table->timestamps();

            $table->index(['facility_id', 'encounter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encounter_referrals');
    }
};
