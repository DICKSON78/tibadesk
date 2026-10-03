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
        Schema::create('consultation_refractions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->string('ob_re_sph')->nullable();
            $table->string('ob_re_cyl')->nullable();
            $table->string('ob_re_axis')->nullable();
            $table->string('ob_re_va')->nullable();
            $table->string('ob_le_sph')->nullable();
            $table->string('ob_le_cyl')->nullable();
            $table->string('ob_le_axis')->nullable();
            $table->string('ob_le_va')->nullable();
            $table->string('sub_re_sph')->nullable();
            $table->string('sub_re_cyl')->nullable();
            $table->string('sub_re_axis')->nullable();
            $table->string('sub_re_va')->nullable();
            $table->string('sub_re_add')->nullable();
            $table->string('sub_re_add_va')->nullable();
            $table->string('sub_le_sph')->nullable();
            $table->string('sub_le_cyl')->nullable();
            $table->string('sub_le_axis')->nullable();
            $table->string('sub_le_va')->nullable();
            $table->string('sub_le_add')->nullable();
            $table->string('sub_le_add_va')->nullable();
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
        Schema::dropIfExists('consultation_refractions');
    }
};
