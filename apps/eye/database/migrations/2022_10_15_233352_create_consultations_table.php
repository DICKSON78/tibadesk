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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id');
            $table->enum('patient_direction', ['Direct to Doctor', 'Direct to Optician'])->default('Direct to Doctor');
            $table->text('chief_complaint')->nullable();
            $table->text('history_present_illness')->nullable();
            $table->text('family_history')->nullable();
            $table->text('general_health')->nullable();
            $table->text('family_ocular_history')->nullable();
            $table->text('family_general_history')->nullable();
            $table->text('pupils')->nullable();
            $table->text('extra_ocular_muscles')->nullable();
            $table->enum('patient_to_return', ['Yes', 'No'])->default('No');
            $table->date('to_return_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->enum('status', ['Pending', 'Consulted'])->default('Pending');
            $table->enum('require_glass', ['Yes', 'No'])->default('No');
            $table->dateTime('sent_to_optician_at')->nullable();
            $table->foreignId('sent_to_optician_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('payment_cache_item_id')
                ->references('id')
                ->on('patient_payment_cache_items')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('sent_to_optician_by')
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
        Schema::dropIfExists('consultations');
    }
};
