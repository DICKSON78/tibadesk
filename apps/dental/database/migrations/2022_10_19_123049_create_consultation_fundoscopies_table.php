<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consultation_fundoscopies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('consultation_fundoscopies');
    }
};
