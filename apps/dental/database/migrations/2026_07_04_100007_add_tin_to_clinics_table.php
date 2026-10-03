<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTinToClinicsTable extends Migration
{
    public function up()
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->string('tin')->nullable()->after('phone')->comment('TRA Taxpayer Identification Number');
            $table->string('vrn')->nullable()->after('tin')->comment('VAT Registration Number');
            $table->string('efd_serial')->nullable()->after('vrn')->comment('EFD Serial Number');
            $table->text('receipt_footer')->nullable()->after('efd_serial')->comment('TRA-compliant receipt footer text');
        });
    }

    public function down()
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->dropColumn(['tin', 'vrn', 'efd_serial', 'receipt_footer']);
        });
    }
}
