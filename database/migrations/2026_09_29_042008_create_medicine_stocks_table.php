<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicine_stocks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->integer('quantity_on_hand')->default(0);
            $table->unsignedInteger('reorder_level')->default(0);
            $table->date('last_counted_on')->nullable();

            $table->timestamps();

            $table->unique(['facility_id', 'medicine_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicine_stocks');
    }
};
