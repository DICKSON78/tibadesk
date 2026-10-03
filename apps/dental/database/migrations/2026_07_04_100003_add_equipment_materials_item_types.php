<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddEquipmentMaterialsItemTypes extends Migration
{
    public function up()
    {
        $now = now()->toDateTimeString();
        
        $types = [
            ['name' => 'Equipment', 'description' => 'Medical equipment and devices', 'status' => 'Active'],
            ['name' => 'Materials', 'description' => 'Consumable materials and supplies', 'status' => 'Active'],
        ];

        foreach ($types as $type) {
            DB::table('item_types')->updateOrInsert(
                ['name' => $type['name']],
                [
                    'description' => $type['description'],
                    'status' => $type['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    public function down()
    {
        DB::table('item_types')->whereIn('name', ['Equipment', 'Materials'])->delete();
    }
}
