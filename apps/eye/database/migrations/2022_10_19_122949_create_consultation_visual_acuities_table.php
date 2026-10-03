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
        Schema::create('consultation_visual_acuities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->string('unaided_re_va')->nullable();
            $table->string('unaided_re_ph')->nullable();
            $table->string('unaided_ipd')->nullable();
            $table->string('unaided_le_va')->nullable();
            $table->string('unaided_le_ph')->nullable();
            $table->string('aided_re_va')->nullable();
            $table->string('aided_re_va_description')->nullable();
            $table->string('aided_le_va')->nullable();
            $table->string('aided_le_va_description')->nullable();
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
        Schema::dropIfExists('consultation_visual_acuities');
    }
};
