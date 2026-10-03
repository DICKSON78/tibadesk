<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemType;
use App\Models\ConsultationType;
use App\Models\UnitOfMeasure;
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
        $clinic_id = 1;

        $dentalLabConsultationType = ConsultationType::where('name', 'Dental Lab')->first();
        $pharmacyConsultationType = ConsultationType::where('name', 'Pharmacy')->first();
        $procedureConsultationType = ConsultationType::where('name', 'Procedure')->first();
        
        $dentalMaterialsType = ItemType::where('name', 'Dental Materials')->first();
        $dentalProstheticsType = ItemType::where('name', 'Dental Prosthetics')->first();
        $pharmaceuticalItemType = ItemType::where('name', 'Pharmaceutical')->first();
        $serviceItemType = ItemType::where('name', 'Service')->first();
        
        $pcUnit = UnitOfMeasure::where('name', 'PC')->first();
        $mgUnit = UnitOfMeasure::where('name', 'mg')->first();
        $bottleUnit = UnitOfMeasure::where('name', 'Btl')->first();
        $tubeUnit = UnitOfMeasure::where('name', 'Tube')->first();
        $kitUnit = UnitOfMeasure::where('name', 'Kit')->first();
        
        $cashPaymentMode = PaymentMode::where('name', 'Cash')->first();

        $dentalMaterialItems = [
            [
                'name' => 'Composite Resin - Anterior',
                'code' => 'COMP-ANT-001',
                'item_type_id' => $dentalMaterialsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 30,
                'unit_buying_price' => 15.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Composite Resin - Posterior',
                'code' => 'COMP-POST-001',
                'item_type_id' => $dentalMaterialsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 25,
                'unit_buying_price' => 18.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Glass Ionomer Cement',
                'code' => 'GIC-001',
                'item_type_id' => $dentalMaterialsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $kitUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 15,
                'unit_buying_price' => 12.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Impression Material (Alginate)',
                'code' => 'IMP-ALGINATE-001',
                'item_type_id' => $dentalMaterialsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 40,
                'unit_buying_price' => 8.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Dental Bonding Agent',
                'code' => 'BOND-001',
                'item_type_id' => $dentalMaterialsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 20,
                'unit_buying_price' => 22.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        $dentalProstheticItems = [
            [
                'name' => 'Acrylic Denture Base',
                'code' => 'DENT-ACRYLIC-001',
                'item_type_id' => $dentalProstheticsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 10,
                'unit_buying_price' => 35.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Porcelain Crown',
                'code' => 'CROWN-PORC-001',
                'item_type_id' => $dentalProstheticsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 8,
                'unit_buying_price' => 65.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Metal Crown',
                'code' => 'CROWN-METAL-001',
                'item_type_id' => $dentalProstheticsType->id,
                'consultation_type_id' => $dentalLabConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 12,
                'unit_buying_price' => 45.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        $pharmacyItems = [
            [
                'name' => 'Amoxicillin 500mg',
                'code' => 'AMOX-500-001',
                'item_type_id' => $pharmaceuticalItemType->id,
                'consultation_type_id' => $pharmacyConsultationType->id,
                'unit_of_measure_id' => $mgUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 100,
                'unit_buying_price' => 5.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Metronidazole 400mg',
                'code' => 'METRO-400-001',
                'item_type_id' => $pharmaceuticalItemType->id,
                'consultation_type_id' => $pharmacyConsultationType->id,
                'unit_of_measure_id' => $mgUnit->id,
                'is_consultation_item' => 'No',
                'is_stock_item' => 'Yes',
                'balance' => 80,
                'unit_buying_price' => 4.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        $procedureItems = [
            [
                'name' => 'Dental Check-up',
                'code' => 'PROC-CHECKUP-001',
                'item_type_id' => $serviceItemType->id,
                'consultation_type_id' => $procedureConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 20.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Dental X-Ray',
                'code' => 'PROC-XRAY-001',
                'item_type_id' => $serviceItemType->id,
                'consultation_type_id' => $procedureConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 35.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'name' => 'Teeth Cleaning (Scaling)',
                'code' => 'PROC-SCALE-001',
                'item_type_id' => $serviceItemType->id,
                'consultation_type_id' => $procedureConsultationType->id,
                'unit_of_measure_id' => $pcUnit->id,
                'is_consultation_item' => 'Yes',
                'is_stock_item' => 'No',
                'balance' => null,
                'unit_buying_price' => 25.00,
                'status' => 'Active',
                'clinic_id' => $clinic_id,
                'created_at' => $now,
                'updated_at' => $now
            ],
        ];

        $allItems = array_merge($dentalMaterialItems, $dentalProstheticItems, $pharmacyItems, $procedureItems);

        foreach ($allItems as $itemData) {
            $item = Item::create($itemData);

            if ($cashPaymentMode) {
                ItemPrice::create([
                    'item_id' => $item->id,
                    'payment_mode_id' => $cashPaymentMode->id,
                    'unit_price' => $itemData['unit_buying_price'] * 1.5,
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
            }
        }

        $this->command->info('Sample dental items created successfully!');
        $this->command->info('Created ' . count($dentalMaterialItems) . ' dental material items');
        $this->command->info('Created ' . count($dentalProstheticItems) . ' dental prosthetic items');
        $this->command->info('Created ' . count($pharmacyItems) . ' pharmacy items');
        $this->command->info('Created ' . count($procedureItems) . ' procedure items');
    }
}
