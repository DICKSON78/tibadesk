<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNhifClaimsTable extends Migration
{
    public function up()
    {
        Schema::create('nhif_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->nullOnDelete();
            $table->string('authorization_no')->nullable();
            $table->string('member_no')->nullable();
            $table->string('patient_name');
            $table->text('diagnosis')->nullable();
            $table->text('treatment_provided')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_approved', 12, 2)->default(0);
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'paid'])->default('draft');
            $table->date('claim_date')->nullable();
            $table->date('submitted_date')->nullable();
            $table->date('approved_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('clinic_id')->nullable()->constrained('clinics');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('nhif_claims');
    }
}
