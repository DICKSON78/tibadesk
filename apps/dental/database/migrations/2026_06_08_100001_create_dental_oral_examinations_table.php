<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalOralExaminationsTable extends Migration
{
    public function up()
    {
        Schema::create('dental_oral_examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->text('lips')->nullable();
            $table->text('buccal_mucosa')->nullable();
            $table->text('tongue')->nullable();
            $table->text('floor_of_mouth')->nullable();
            $table->text('hard_palate')->nullable();
            $table->text('soft_palate')->nullable();
            $table->text('oropharynx')->nullable();
            $table->text('gingiva')->nullable();
            $table->text('salivary_glands')->nullable();
            $table->text('occlusion')->nullable();
            $table->text('other_findings')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_oral_examinations');
    }
}
