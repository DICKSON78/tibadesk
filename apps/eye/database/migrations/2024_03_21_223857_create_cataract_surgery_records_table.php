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
        Schema::create('cataract_surgery_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_cache_item_id');
            $table->string('unaided_re_va')->nullable();
            $table->string('unaided_le_va')->nullable();
            $table->string('aided_re_va')->nullable();
            $table->string('aided_le_va')->nullable();
            $table->string('lens_examination_re')->nullable();
            $table->string('lens_examination_le')->nullable();
            $table->string('other_ocular_pathology')->nullable();
            $table->string('other_ocular_pathology_specify')->nullable();
            $table->text('clinical_data')->nullable();
            $table->string('operated_eye')->nullable();
            $table->string('operated_eye_refraction_sph')->nullable();
            $table->string('operated_eye_refraction_sph_postop')->nullable();
            $table->string('operated_eye_refraction_cyl')->nullable();
            $table->string('operated_eye_refraction_axis')->nullable();
            $table->string('operated_eye_biometry_k1')->nullable();
            $table->string('operated_eye_biometry_k2')->nullable();
            $table->string('operated_eye_biometry_axial_length')->nullable();
            $table->date('operation_date')->nullable();
            $table->string('operation_place')->nullable();
            $table->string('surgery_type')->nullable();
            $table->string('iol')->nullable();
            $table->string('hospital_id')->nullable();
            $table->string('surgeon_id')->nullable();
            $table->string('training')->nullable();
            $table->string('operative_complications')->nullable();
            $table->string('section')->nullable();
            $table->string('capsulotomy')->nullable();
            $table->string('iol_type')->nullable();
            $table->string('iol_power')->nullable();
            $table->string('suture')->nullable();
            $table->string('number_of_sutures')->nullable();
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
        Schema::dropIfExists('cataract_surgery_records');
    }
};
