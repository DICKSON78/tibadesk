<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
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

    public function down()
    {
        Schema::dropIfExists('consultation_dental_functional_tests');
    }
};
