<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id');
            $table->text('chief_complaint')->nullable();
            $table->text('history_present_illness')->nullable();
            $table->text('family_history')->nullable();
            $table->text('general_health')->nullable();
            $table->text('family_dental_history')->nullable();
            $table->text('family_general_history')->nullable();
            $table->enum('patient_to_return', ['Yes', 'No'])->default('No');
            $table->date('to_return_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->enum('status', ['Pending', 'Consulted'])->default('Pending');
            $table->string('oral_hygiene_status')->nullable();
            $table->string('tobacco_use')->nullable();
            $table->string('alcohol_use')->nullable();
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
        });
    }

    public function down()
    {
        Schema::dropIfExists('consultations');
    }
};
