<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->string('code', 40);
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('form', 60)->nullable();
            $table->string('strength', 60)->nullable();
            $table->string('unit', 40)->default('tablet');
            $table->unsignedInteger('unit_price')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['facility_id', 'code']);
            $table->index(['facility_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
