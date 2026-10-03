<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consultation_facial_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->string('facial_symmetry')->nullable();
            $table->string('facial_swelling')->nullable();
            $table->string('facial_trauma')->nullable();
            $table->string('right_tmj_tenderness')->nullable();
            $table->string('right_tmj_clicking')->nullable();
            $table->string('right_tmj_pain_on_opening')->nullable();
            $table->string('left_tmj_tenderness')->nullable();
            $table->string('left_tmj_clicking')->nullable();
            $table->string('left_tmj_pain_on_opening')->nullable();
            $table->string('submandibular_lymph_nodes')->nullable();
            $table->string('cervical_lymph_nodes')->nullable();
            $table->string('pre_auricular_lymph_nodes')->nullable();
            $table->string('lip_competence')->nullable();
            $table->string('lip_dryness')->nullable();
            $table->string('lip_lesions')->nullable();
            $table->string('palate_shape')->nullable();
            $table->string('palate_lesions')->nullable();
            $table->string('hard_palate')->nullable();
            $table->string('soft_palate')->nullable();
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
        Schema::dropIfExists('consultation_facial_assessments');
    }
};
