<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCancerRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('cancer_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->nullOnDelete();
            $table->string('cancer_type');
            $table->string('anatomical_site')->nullable();
            $table->enum('diagnosis_method', ['Clinical', 'Histopathology', 'Imaging', 'Surgery', 'Other'])->nullable();
            $table->date('diagnosis_date')->nullable();
            $table->string('stage')->nullable()->comment('Stage I-IV');
            $table->text('notes')->nullable();
            $table->foreignId('clinic_id')->nullable()->constrained('clinics');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cancer_records');
    }
}
