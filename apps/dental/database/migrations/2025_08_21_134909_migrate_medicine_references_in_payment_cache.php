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
        // Update patient_payment_cache_items to reference medicines table for pharmaceutical items
        $pharmaceuticalItems = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->where('item_types.name', 'Pharmaceutical')
            ->where('items.is_stock_item', 'Yes')
            ->select('items.id as old_item_id', 'medicines.id as new_medicine_id')
            ->join('medicines', function($join) {
                $join->on('items.name', '=', 'medicines.name')
                     ->on('items.clinic_id', '=', 'medicines.clinic_id');
            })
            ->get();

        foreach ($pharmaceuticalItems as $item) {
            DB::table('patient_payment_cache_items')
                ->where('item_id', $item->old_item_id)
                ->whereNull('medicine_id')
                ->update([
                    'medicine_id' => $item->new_medicine_id
                ]);
        }

        // Log migration results
        $updatedCount = DB::table('patient_payment_cache_items')
            ->whereNotNull('medicine_id')
            ->count();
        
        \Log::info("Medicine references migration completed: {$updatedCount} records updated with medicine_id");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Clear medicine_id references
        DB::table('patient_payment_cache_items')
            ->whereNotNull('medicine_id')
            ->update(['medicine_id' => null]);
    }
};
