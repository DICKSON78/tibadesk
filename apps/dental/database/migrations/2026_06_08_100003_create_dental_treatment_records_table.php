<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDentalTreatmentRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('dental_treatment_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id')->constrained('patient_payment_cache_items')->cascadeOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->nullOnDelete();
            $table->string('treatment_type')->nullable();
            $table->integer('tooth_number')->nullable();
            $table->string('tooth_surface')->nullable();
            $table->string('anaesthesia_type')->nullable();
            $table->text('preoperative_notes')->nullable();
            $table->text('intraoperative_notes')->nullable();
            $table->text('postoperative_notes')->nullable();
            $table->text('prescription')->nullable();
            $table->string('material_used')->nullable();
            $table->string('status')->default('Planned')->comment('Planned, In Progress, Completed, Cancelled');
            $table->foreignId('treated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('treatment_date')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dental_treatment_records');
    }
}
