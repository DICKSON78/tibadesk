<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhaseToDentalTreatmentRecords extends Migration
{
    public function up()
    {
        Schema::table('dental_treatment_records', function (Blueprint $table) {
            $table->string('phase')->nullable()->after('status')
                ->comment('Phase 1: Initial/Urgent, Phase 2: Restorative, Phase 3: Cosmetic/Rehab');
        });
    }

    public function down()
    {
        Schema::table('dental_treatment_records', function (Blueprint $table) {
            $table->dropColumn('phase');
        });
    }
}
