<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDentalFieldsToConsultationsTable extends Migration
{
    public function up()
    {
        // Guarded per column. oral_hygiene_status, tobacco_use and alcohol_use
        // were already introduced by the original create_consultations_table
        // migration, so a database that ran that migration already has them and
        // an unguarded ALTER aborts the whole batch. The check is per column
        // rather than per table because a fresh database needs all six while a
        // legacy one needs only the three that are genuinely new.
        $existing = Schema::getColumnListing('consultations');

        Schema::table('consultations', function (Blueprint $table) use ($existing) {
            if (! in_array('extra_oral_examination', $existing, true)) {
                $table->text('extra_oral_examination')->nullable()->after('general_health');
            }

            if (! in_array('tmj_examination', $existing, true)) {
                $table->text('tmj_examination')->nullable()->after('extra_oral_examination');
            }

            if (! in_array('lymph_nodes', $existing, true)) {
                $table->text('lymph_nodes')->nullable()->after('tmj_examination');
            }

            if (! in_array('oral_hygiene_status', $existing, true)) {
                $table->text('oral_hygiene_status')->nullable()->after('lymph_nodes');
            }

            if (! in_array('tobacco_use', $existing, true)) {
                $table->text('tobacco_use')->nullable()->after('oral_hygiene_status');
            }

            if (! in_array('alcohol_use', $existing, true)) {
                $table->text('alcohol_use')->nullable()->after('tobacco_use');
            }
        });
    }

    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn([
                'extra_oral_examination',
                'tmj_examination',
                'lymph_nodes',
                'oral_hygiene_status',
                'tobacco_use',
                'alcohol_use',
            ]);
        });
    }
}
