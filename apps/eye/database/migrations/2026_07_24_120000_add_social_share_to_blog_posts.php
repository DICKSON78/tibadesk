<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('shared_to_facebook')->nullable();
            $table->string('shared_to_instagram')->nullable();
            $table->timestamp('shared_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['shared_to_facebook', 'shared_to_instagram', 'shared_at']);
        });
    }
};
