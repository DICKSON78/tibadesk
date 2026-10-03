<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dental_surgery_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id')->nullable();
            $table->foreignId('patient_id')->nullable();
            $table->string('surgery_type')->nullable();
            $table->string('tooth_number')->nullable();
            $table->text('pre_op_diagnosis')->nullable();
            $table->text('post_op_diagnosis')->nullable();
            $table->text('clinical_data')->nullable();
            $table->string('anesthesia_type')->nullable();
            $table->string('anesthesia_amount')->nullable();
            $table->text('surgical_technique')->nullable();
            $table->string('complications')->nullable();
            $table->text('operative_findings')->nullable();
            $table->text('procedure_done')->nullable();
            $table->date('operation_date')->nullable();
            $table->foreignId('surgeon_id')->nullable();
            $table->foreignId('assistant_surgeon_id')->nullable();
            $table->text('postoperative_instructions')->nullable();
            $table->text('postoperative_data')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->enum('status', ['Draft', 'Saved'])->default('Draft');
            $table->timestamp('saved_at')->nullable();
            $table->foreignId('saved_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('payment_cache_item_id')
                ->references('id')
                ->on('patient_payment_cache_items')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('surgeon_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('assistant_surgeon_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('saved_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_surgery_records');
    }
};
