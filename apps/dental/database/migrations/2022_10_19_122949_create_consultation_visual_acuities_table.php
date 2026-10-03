<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consultation_pain_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->string('pain_level')->nullable();
            $table->string('pain_location')->nullable();
            $table->string('pain_type')->nullable();
            $table->string('pain_duration')->nullable();
            $table->string('pain_triggers')->nullable();
            $table->string('pain_relieving_factors')->nullable();
            $table->string('pain_radiation')->nullable();
            $table->string('swelling_level')->nullable();
            $table->string('swelling_location')->nullable();
            $table->string('numbness_location')->nullable();
            $table->string('numbness_severity')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('consultation_id')
                ->references('id')
                ->on('consultations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('consultation_pain_assessments');
    }
};
