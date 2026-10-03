<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddDentalConsultationType extends Migration
{
    public function up()
    {
        DB::table('consultation_types')->updateOrInsert(
            ['name' => 'Dental'],
            [
                'description' => 'Dental consultation and treatment',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down()
    {
        DB::table('consultation_types')->where('name', 'Dental')->delete();
    }
}
