<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // This migration widens an enum that three other migrations assume
        // already exists, but no migration in this package ever created the
        // column. On a database that has been migrated from the original
        // consultation schema the column is simply absent, so the ALTER below
        // fails with "Unknown column" and takes the whole batch with it.
        //
        // Creating it here — guarded, because a database that did get it from
        // a hand-run ALTER or a partial restore already has it — means the
        // migrations that follow this one, which both reference the column,
        // can rely on it existing.
        if (! Schema::hasColumn('consultations', 'patient_direction')) {
            Schema::table('consultations', function (Blueprint $table) {
                $table->enum('patient_direction', ['Direct to Doctor', 'Direct to Optician'])
                    ->default('Direct to Doctor')
                    ->after('general_health');
            });
        }

        // Sync the live consultations.patient_direction enum with the values the
        // application actually uses: Direct to Doctor (default), Direct to Dental Lab
        // (used for the direct-to-lab dispense auto-complete), and Referral (MoH/DPR
        // report flag). The previous enum only allowed 'Direct to Optician', which no
        // longer matches any code path.
        DB::statement("ALTER TABLE consultations MODIFY patient_direction ENUM('Direct to Doctor','Direct to Dental Lab','Referral') NOT NULL DEFAULT 'Direct to Doctor'");

        // Rows written before the column existed carry the default, but any row
        // that predates this migration on a database where the column was added
        // by hand may still hold the old spelling.
        DB::table('consultations')
            ->where('patient_direction', 'Direct to Optician')
            ->update(['patient_direction' => 'Direct to Dental Lab']);
    }

    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('patient_direction');
        });
    }
};
