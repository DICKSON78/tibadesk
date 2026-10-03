<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalChartingTable extends Migration
{
    public function up()
    {
        Schema::create('dental_charting', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->integer('tooth_number');
            $table->string('tooth_quadrant')->nullable();
            $table->string('status')->nullable()->comment('Present, Missing, Impacted, Fractured, etc.');
            $table->string('caries_status')->nullable()->comment('Sound, Decayed, Filled, etc.');
            $table->string('restoration_type')->nullable();
            $table->text('surface_involved')->nullable();
            $table->string('mobility')->nullable();
            $table->string('periodontal_pocket_depth')->nullable();
            $table->boolean('bleeding_on_probing')->default(false);
            $table->string('furcation_involvement')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['consultation_id', 'tooth_number']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_charting');
    }
}
