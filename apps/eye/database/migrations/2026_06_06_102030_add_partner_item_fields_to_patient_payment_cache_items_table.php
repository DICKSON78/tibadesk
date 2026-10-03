<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->boolean('is_partner_item')->default(false)->after('comments');
            $table->string('collaborator_name')->nullable()->after('is_partner_item');
        });
    }

    public function down(): void
    {
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->dropColumn(['is_partner_item', 'collaborator_name']);
        });
    }
};
