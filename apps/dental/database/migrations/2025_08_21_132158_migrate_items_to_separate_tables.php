<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Migrate pharmaceutical items to medicines table
        $pharmaceuticalItems = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->where('item_types.name', 'Pharmaceutical')
            ->where('items.is_stock_item', 'Yes')
            ->select([
                'items.clinic_id',
                'items.name',
                'items.code',
                'items.unit_of_measure_id',
                'items.balance',
                'items.new_balance',
                'items.unit_buying_price',
                'items.expiry_date',
                'items.minimum_stock',
                'items.has_expiry',
                'items.status',
                'items.created_at',
                'items.updated_at'
            ])
            ->get();

        foreach ($pharmaceuticalItems as $item) {
            DB::table('medicines')->insert([
                'clinic_id' => $item->clinic_id,
                'name' => $item->name,
                'code' => $item->code,
                'unit_of_measure_id' => $item->unit_of_measure_id,
                'balance' => $item->balance ?? 0,
                'new_balance' => $item->new_balance,
                'unit_buying_price' => $item->unit_buying_price,
                'expiry_date' => $item->expiry_date,
                'minimum_stock' => $item->minimum_stock ?? 0,
                'has_expiry' => $item->has_expiry ?? 'Yes',
                'status' => $item->status ?? 'Active',
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at
            ]);
        }

        // Migrate non-pharmaceutical stock items to inventory_items table
        $inventoryItems = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->where('item_types.name', '!=', 'Pharmaceutical')
            ->where('items.is_stock_item', 'Yes')
            ->select([
                'items.clinic_id',
                'items.name',
                'items.code',
                'items.item_type_id',
                'items.unit_of_measure_id',
                'items.balance',
                'items.new_balance',
                'items.unit_buying_price',
                'items.expiry_date',
                'items.minimum_stock',
                'items.has_expiry',
                'items.status',
                'items.created_at',
                'items.updated_at'
            ])
            ->get();

        foreach ($inventoryItems as $item) {
            DB::table('inventory_items')->insert([
                'clinic_id' => $item->clinic_id,
                'name' => $item->name,
                'code' => $item->code,
                'item_type_id' => $item->item_type_id,
                'unit_of_measure_id' => $item->unit_of_measure_id,
                'balance' => $item->balance ?? 0,
                'new_balance' => $item->new_balance,
                'unit_buying_price' => $item->unit_buying_price,
                'expiry_date' => $item->expiry_date,
                'minimum_stock' => $item->minimum_stock ?? 0,
                'has_expiry' => $item->has_expiry ?? 'No',
                'status' => $item->status ?? 'Active',
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at
            ]);
        }

        // Log migration results
        $medicineCount = DB::table('medicines')->count();
        $inventoryCount = DB::table('inventory_items')->count();
        
        \Log::info("Items migration completed: {$medicineCount} medicines, {$inventoryCount} inventory items migrated");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Clear the new tables
        DB::table('medicines')->truncate();
        DB::table('inventory_items')->truncate();
    }
};
