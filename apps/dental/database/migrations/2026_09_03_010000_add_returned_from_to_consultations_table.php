<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('consultations', function (Blueprint $table) {
            // Marks a consultation that was sent to a department (procedure / dental lab)
            // and returned to the doctor for review before being discharged to the cashier.
            $table->string('returned_from')->nullable()->after('patient_direction');
        });
    }

    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('returned_from');
        });
    }
};
