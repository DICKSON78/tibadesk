<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_order_id')->constrained('lab_orders')->cascadeOnDelete();
            $table->foreignId('lab_test_id')->constrained('lab_tests')->cascadeOnDelete();
            $table->string('status', 20)->default('pending')->index();
            $table->decimal('result_value', 12, 2)->nullable();
            $table->text('result_text')->nullable();
            // normal / low / high / critical, so a screening result that is
            // out of range is not buried in free text.
            $table->string('result_flag', 20)->nullable();
            $table->text('result_notes')->nullable();
            $table->foreignId('resulted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('resulted_at')->nullable();

            $table->timestamps();

            $table->index(['facility_id', 'lab_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_order_items');
    }
};
