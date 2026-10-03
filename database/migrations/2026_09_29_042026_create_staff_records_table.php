<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('staff_number', 40);
            $table->string('full_name');
            $table->string('department', 80)->nullable();
            $table->string('designation', 80)->nullable();
            $table->string('employment_type', 30)->default('full_time');
            $table->date('hired_on')->nullable();
            $table->unsignedInteger('monthly_salary')->default(0);
            $table->string('phone', 40)->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['facility_id', 'staff_number']);
            $table->index(['facility_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_records');
    }
};
