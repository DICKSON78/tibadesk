<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('consultation_external_examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->string('re_lid')->nullable();
            $table->string('re_sclera')->nullable();
            $table->string('re_cornea')->nullable();
            $table->string('re_conjuctiva')->nullable();
            $table->string('re_iris')->nullable();
            $table->string('re_pupil')->nullable();
            $table->string('re_lens')->nullable();
            $table->string('re_iop')->nullable();
            $table->string('le_lid')->nullable();
            $table->string('le_sclera')->nullable();
            $table->string('le_cornea')->nullable();
            $table->string('le_conjuctiva')->nullable();
            $table->string('le_iris')->nullable();
            $table->string('le_pupil')->nullable();
            $table->string('le_lens')->nullable();
            $table->string('le_iop')->nullable();
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('consultation_external_examinations');
    }
};
