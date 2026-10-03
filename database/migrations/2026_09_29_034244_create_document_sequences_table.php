<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_sequences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();

            // Which series this row counts: patients, encounters, consultations.
            $table->string('kind', 40);

            // The next number to hand out. Held as a counter rather than
            // derived from a COUNT() so two receptionists registering at the
            // same moment cannot be issued the same patient number.
            $table->unsignedBigInteger('next_number')->default(1);

            $table->timestamps();

            $table->unique(['facility_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_sequences');
    }
};
