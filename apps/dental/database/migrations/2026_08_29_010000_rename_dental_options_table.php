<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::rename('dental_options', 'options');
    }

    public function down()
    {
        Schema::rename('options', 'dental_options');
    }
};