<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_media_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // facebook, instagram
            $table->string('account_name'); // display name e.g. "Best Vision FB Page"
            $table->string('page_id')->nullable(); // FB page ID or IG user ID
            $table->text('access_token');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_media_accounts');
    }
};
