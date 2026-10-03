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
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->string('generic_name')->nullable();
            $table->string('brand_name')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('unit_of_measure_id')->nullable();
            $table->double('balance')->default(0);
            $table->double('new_balance')->nullable();
            $table->double('unit_buying_price')->unsigned()->nullable();
            $table->double('selling_price')->unsigned()->nullable();
            $table->date('expiry_date')->nullable();
            $table->double('minimum_stock')->default(0);
            $table->enum('has_expiry', ['Yes', 'No'])->default('Yes');
            $table->enum('prescription_required', ['Yes', 'No'])->default('No');
            $table->enum('controlled_substance', ['Yes', 'No'])->default('No');
            $table->text('dosage_instructions')->nullable();
            $table->text('side_effects')->nullable();
            $table->text('contraindications')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('unit_of_measure_id')
                ->references('id')
                ->on('units_of_measure')
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
        Schema::dropIfExists('medicines');
    }
};
