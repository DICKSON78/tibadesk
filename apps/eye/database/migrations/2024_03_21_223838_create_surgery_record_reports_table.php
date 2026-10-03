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
        Schema::create('surgery_record_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id');
            $table->string('unaided_re_va')->nullable();
            $table->string('unaided_le_va')->nullable();
            $table->string('aided_re_va')->nullable();
            $table->string('aided_le_va')->nullable();
            $table->string('surgeon')->nullable();
            $table->string('assistant_surgeon')->nullable();
            $table->string('scrub_nurse')->nullable();
            $table->string('operation_type')->nullable();
            $table->string('anaesthesia_type')->nullable();
            $table->string('operated_eye')->nullable();
            $table->text('intraoperative_notes')->nullable();
            $table->text('postoperative_management')->nullable();
            $table->text('remarks')->nullable();
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
                ->cascadeOnDelete();
            $table->foreign('created_by')
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('surgery_record_reports');
    }
};
