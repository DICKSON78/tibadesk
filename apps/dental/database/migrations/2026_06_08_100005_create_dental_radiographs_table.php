<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalRadiographsTable extends Migration
{
    public function up()
    {
        Schema::create('dental_radiographs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->string('radiograph_type')->comment('IOPA, Bitewing, OPG, Cephalometric, CBCT');
            $table->string('tooth_number')->nullable();
            $table->text('findings')->nullable();
            $table->text('impression')->nullable();
            $table->string('image_path')->nullable();
            $table->date('taken_date');
            $table->foreignId('taken_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['patient_id', 'taken_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_radiographs');
    }
}
