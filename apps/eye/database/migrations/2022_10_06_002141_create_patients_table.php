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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->enum('gender', ['Male', 'Female']);
            $table->date('date_of_birth')->nullable();
            $table->foreignId('region_id')->nullable();
            $table->foreignId('district_id')->nullable();
            $table->foreignId('ward_id')->nullable();
            $table->string('address')->nullable();
            $table->string('national_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('occupation')->nullable();
            $table->foreignId('payment_mode_id')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('region_id')
                ->references('id')
                ->on('regions')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('district_id')
                ->references('id')
                ->on('districts')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('ward_id')
                ->references('id')
                ->on('wards')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('payment_mode_id')
                ->references('id')
                ->on('payment_modes')
                ->cascadeOnUpdate()
                ->nullOnDelete();
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
        Schema::dropIfExists('patients');
    }
};
