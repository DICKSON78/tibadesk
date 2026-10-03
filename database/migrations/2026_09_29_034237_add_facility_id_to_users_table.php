<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Null means KADETECH platform staff rather than a facility
            // employee. They are the only accounts allowed to read across
            // facilities, and the API refuses them a clinical capability.
            $table->foreignId('facility_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();

            $table->string('role', 40)->default('receptionist')->after('email');
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('facility_id');
            $table->dropColumn(['role', 'is_active']);
        });
    }
};
