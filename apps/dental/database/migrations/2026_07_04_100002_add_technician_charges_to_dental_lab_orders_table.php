<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTechnicianChargesToDentalLabOrdersTable extends Migration
{
    public function up()
    {
        Schema::table('dental_lab_orders', function (Blueprint $table) {
            $table->decimal('technician_charges', 12, 2)->nullable()->after('cost');
            $table->dropColumn('insertion_date');
        });
    }

    public function down()
    {
        Schema::table('dental_lab_orders', function (Blueprint $table) {
            $table->date('insertion_date')->nullable()->after('delivery_date');
            $table->dropColumn('technician_charges');
        });
    }
}
