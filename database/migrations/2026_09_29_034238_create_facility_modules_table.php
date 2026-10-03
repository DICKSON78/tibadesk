<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_modules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();

            // A module key from App\Enums\Module, which is the same catalogue
            // the website publishes.
            $table->string('module', 40);

            $table->timestamp('granted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // One row per facility per module, so a grant is idempotent and a
            // revoke is a single field rather than a delete.
            $table->unique(['facility_id', 'module']);
            $table->index(['facility_id', 'revoked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_modules');
    }
};
