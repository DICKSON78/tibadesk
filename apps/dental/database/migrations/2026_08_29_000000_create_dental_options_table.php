<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dental_options', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index();
            $table->string('label');
            $table->string('value');
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('Active');
            $table->timestamps();

            $table->unique(['category', 'value']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_options');
    }
};