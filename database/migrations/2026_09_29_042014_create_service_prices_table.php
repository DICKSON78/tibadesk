<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_prices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->string('code', 40);
            $table->string('name');
            // Which module the charge belongs to, so a clinic that has not
            // bought the module never sees its price list.
            $table->string('module', 40)->index();
            $table->unsignedInteger('price')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['facility_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_prices');
    }
};
