<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNextOfKinTribeReligionToPatientsTable extends Migration
{
    public function up()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('next_of_kin')->nullable()->after('occupation');
            $table->string('tribe')->nullable()->after('next_of_kin');
            $table->string('religion')->nullable()->after('tribe');
        });
    }

    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['next_of_kin', 'tribe', 'religion']);
        });
    }
}
