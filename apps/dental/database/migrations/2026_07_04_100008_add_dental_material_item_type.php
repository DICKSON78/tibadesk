<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddDentalMaterialItemType extends Migration
{
    public function up()
    {
        DB::table('item_types')->updateOrInsert(
            ['name' => 'Dental Material'],
            [
                'description' => 'Dental consumables and materials (composites, cements, instruments)',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down()
    {
        DB::table('item_types')->where('name', 'Dental Material')->delete();
    }
}
