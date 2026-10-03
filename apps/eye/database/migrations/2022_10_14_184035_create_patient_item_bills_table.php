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
        Schema::create('patient_item_bills', function (Blueprint $table) {
            $table->id();
            $table->double('amount')->unsigned();
            $table->double('discount')->unsigned()->default(0);
            $table->timestamp('created_at')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->enum('status', ['Pending', 'Cleared'])->default('Pending');
            $table->dateTime('cleared_at')->nullable();
            $table->foreignId('cleared_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('cleared_by')
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
        Schema::dropIfExists('patient_item_bills');
    }
};
