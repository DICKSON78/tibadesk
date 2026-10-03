<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('consultation_facial_assessments')) {
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

        if (!Schema::hasTable('consultation_dental_functional_tests')) {
            Schema::create('consultation_dental_functional_tests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('consultation_id');
                $table->string('maximum_mouth_opening')->nullable();
                $table->string('lateral_excursion_right')->nullable();
                $table->string('lateral_excursion_left')->nullable();
                $table->string('protrusion')->nullable();
                $table->string('bite_force')->nullable();
                $table->string('bite_classification')->nullable();
                $table->string('occlusal_relationship')->nullable();
                $table->string('cross_bite')->nullable();
                $table->string('overjet')->nullable();
                $table->string('overbite')->nullable();
                $table->string('centric_relation')->nullable();
                $table->string('centric_occlusion')->nullable();
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

        if (!Schema::hasTable('consultation_pain_assessments')) {
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
    }

    public function down()
    {
        Schema::dropIfExists('consultation_facial_assessments');
        Schema::dropIfExists('consultation_dental_functional_tests');
        Schema::dropIfExists('consultation_pain_assessments');
    }
};
