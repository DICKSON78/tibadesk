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
        Schema::create('patient_item_bill_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id');
            $table->foreignId('channel_id')->nullable();
            $table->double('amount')->unsigned();
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('bill_id')
                ->references('id')
                ->on('patient_item_bills')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('channel_id')
                ->references('id')
                ->on('payment_channels')
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
        Schema::dropIfExists('patient_item_bill_payments');
    }
};
