<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemType;
use App\Models\ConsultationType;
use App\Models\UnitOfMeasure;
use App\Models\LensType;
use App\Models\PaymentMode;
use App\Models\ItemPrice;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SampleItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $now = Carbon::now()->toDateTimeString();
        $clinic_id = 1; // Default clinic

        // Get required IDs
        $glassConsultationType = ConsultationType::where('name', 'Glass')->first();
        $pharmacyConsultationType = ConsultationType::where('name', 'Pharmacy')->first();
        $procedureConsultationType = ConsultationType::where('name', 'Procedure')->first();
        
        $lensItemType = ItemType::where('name', 'Lens')->first();
        $frameItemType = ItemType::where('name', 'Frame')->first();
        $pharmaceuticalItemType = ItemType::where('name', 'Pharmaceutical')->first();
        $serviceItemType = ItemType::where('name', 'Service')->first();
        
        $pcUnit = UnitOfMeasure::where('name', 'PC')->first();
        $mgUnit = UnitOfMeasure::where('name', 'mg')->first();
        $bottleUnit = UnitOfMeasure::where('name', 'Btl')->first();
        
        $cashPaymentMode = PaymentMode::where('name', 'Cash')->first();

        // Create lens types if they don't exist
        $lensTypes = [
            ['name' => 'Single Vision', 'description' => 'Single vision lenses'],
            ['name' => 'Bifocal', 'description' => 'Bifocal lenses'],
            ['name' => 'Progressive', 'description' => 'Progressive lenses'],
            ['name' => 'Reading', 'description' => 'Reading glasses'],
            ['name' => 'Distance', 'description' => 'Distance vision lenses'],
        ];

        foreach ($lensTypes as $lensTypeData) {
            $lensType = LensType::firstOrCreate(
                ['name' => $lensTypeData['name']],
                [
                    'description' => $lensTypeData['description'],
                    'status' => 'Active',
                    'created_at' => $now,
                    'updated_at' => $now
                ]
            );
        }

        // Sample Glass Items (Lenses)
        $glassItems = [
            [
                'name' => 'Single Vision Lens - Clear',
                'code' => 'SV-CLEAR-001',
                'item_type_id' => $lensItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'lens_type_id' => LensType::where('name', 'Single Vision')->first()->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 50,
                'unit_buying_price' => 25.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Single Vision Lens - Anti-Reflective',
                'code' => 'SV-AR-001',
                'item_type_id' => $lensItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'lens_type_id' => LensType::where('name', 'Single Vision')->first()->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 30,
                'unit_buying_price' => 45.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Bifocal Lens - Clear',
                'code' => 'BF-CLEAR-001',
                'item_type_id' => $lensItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'lens_type_id' => LensType::where('name', 'Bifocal')->first()->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 25,
                'unit_buying_price' => 35.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Progressive Lens - Premium',
                'code' => 'PROG-PREM-001',
                'item_type_id' => $lensItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'lens_type_id' => LensType::where('name', 'Progressive')->first()->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 20,
                'unit_buying_price' => 85.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Reading Lens - Standard',
                'code' => 'READ-STD-001',
                'item_type_id' => $lensItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'lens_type_id' => LensType::where('name', 'Reading')->first()->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 40,
                'unit_buying_price' => 20.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        // Sample Glass Items (Frames)
        $frameItems = [
            [
                'name' => 'Classic Metal Frame - Silver',
                'code' => 'FRAME-METAL-001',
                'item_type_id' => $frameItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 15,
                'unit_buying_price' => 30.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Plastic Frame - Black',
                'code' => 'FRAME-PLASTIC-001',
                'item_type_id' => $frameItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 20,
                'unit_buying_price' => 25.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Designer Frame - Gold',
                'code' => 'FRAME-DESIGNER-001',
                'item_type_id' => $frameItemType->id,
                'consultation_type_id' => $glassConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 10,
                'unit_buying_price' => 75.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        // Sample Pharmacy Items
        $pharmacyItems = [
            [
                'name' => 'Eye Drops - Artificial Tears',
                'code' => 'EYE-DROPS-001',
                'item_type_id' => $pharmaceuticalItemType->id,
                'consultation_type_id' => $pharmacyConsultationType->id,
                'unit_of_measure_id' => $bottleUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 25,
                'unit_buying_price' => 8.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Antibiotic Eye Drops',
                'code' => 'EYE-ANTIBIOTIC-001',
                'item_type_id' => $pharmaceuticalItemType->id,
                'consultation_type_id' => $pharmacyConsultationType->id,
                'unit_of_measure_id' => $bottleUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 15,
                'unit_buying_price' => 12.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        // Sample Procedure Items
        $procedureItems = [
            [
                'name' => 'Eye Examination',
                'code' => 'PROC-EYE-EXAM-001',
                'item_type_id' => $serviceItemType->id,
                'consultation_type_id' => $procedureConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 50.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Glaucoma Screening',
                'code' => 'PROC-GLAUCOMA-001',
                'item_type_id' => $serviceItemType->id,
                'consultation_type_id' => $procedureConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 75.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        // Combine all items
        $allItems = array_merge($glassItems, $frameItems, $pharmacyItems, $procedureItems);

        // Insert items
        foreach ($allItems as $itemData) {
            $item = Item::create($itemData);

            // Create default price for Cash payment mode
            if ($cashPaymentMode) {
                ItemPrice::create([
                    'item_id' => $item->id,
                    'payment_mode_id' => $cashPaymentMode->id,
                    'unit_price' => $itemData['unit_buying_price'] * 1.5, // 50% markup
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
            }
        }

        $this->command->info('Sample items created successfully!');
        $this->command->info('Created ' . count($glassItems) . ' glass items (lenses)');
        $this->command->info('Created ' . count($frameItems) . ' glass items (frames)');
        $this->command->info('Created ' . count($pharmacyItems) . ' pharmacy items');
        $this->command->info('Created ' . count($procedureItems) . ' procedure items');
    }
}
