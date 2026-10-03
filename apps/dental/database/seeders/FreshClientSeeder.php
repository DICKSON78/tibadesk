<?php

namespace Database\Seeders;

use App\Constants\RolePrivileges;
use App\Models\Clinic;
use App\Models\ConsultationType;
use App\Models\ItemType;
use App\Models\JobTitle;
use App\Models\PaymentChannel;
use App\Models\PaymentMode;
use App\Models\Preference;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\UserPrivilege;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FreshClientSeeder extends Seeder
{
    /**
     * Seed a clean client installation: a single clinic, one admin user
     * (the clinic owner) and the reference data required for the system
     * to run. No demo users and no sample patients.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now()->toDateTimeString();

        Clinic::insert([
            [
                'name' => 'Sarah Dental Clinic',
                'phone' => '',
                'email' => '',
                'address' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        JobTitle::insert([
            ['clinic_id' => 1, 'name' => 'Receptionist', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cashier', 'created_at' => $now, 'updated_at' => $now],
        ]);

        User::insert([
            [
                'clinic_id' => 1,
                'first_name' => 'Sarah',
                'last_name' => 'Admin',
                'role' => 'Admin',
                'designation' => 'Admin',
                'username' => 'sarah',
                'password' => Hash::make('1234'),
                'gender' => 'Female',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Assign privileges based on role
        $users = User::all();
        foreach ($users as $user) {
            $privileges = RolePrivileges::getPrivilegesForRole($user->role);
            if (!empty($privileges)) {
                $rows = array_map(fn($p) => ['user_id' => $user->id, 'privilege' => $p], $privileges);
                UserPrivilege::insert($rows);
            }
        }

        ConsultationType::insert([
            ['name' => 'Pharmacy', 'code' => 'pharmacy', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Lab', 'code' => 'dental_lab', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Procedure', 'code' => 'procedure', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'code' => 'others', 'created_at' => $now, 'updated_at' => $now],
        ]);

        PaymentMode::insert([
            ['clinic_id' => 1, 'name' => 'Cash', 'code' => 'cash', 'transaction_type' => 'Cash', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'code' => 'credit', 'transaction_type' => 'Credit', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Create default payment channels (parity with live install's 10 channels)
        PaymentChannel::insert([
            ['clinic_id' => 1, 'name' => 'NHIF', 'code' => 'nhif', 'description' => 'NHIF insurance payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cash', 'code' => 'cash', 'description' => 'Cash payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'code' => 'credit', 'description' => 'Credit payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Bank Transfer', 'code' => 'bank_transfer', 'description' => 'Bank transfer payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cheque', 'code' => 'cheque', 'description' => 'Cheque payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Card Payment', 'code' => 'card', 'description' => 'Credit/Debit card payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'M-Pesa', 'code' => 'mpesa', 'description' => 'Vodacom mobile money', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Tigo Pesa', 'code' => 'tigo_pesa', 'description' => 'Tigo mobile money', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Airtel Money', 'code' => 'airtel_money', 'description' => 'Airtel mobile money', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Halopesa', 'code' => 'halopesa', 'description' => 'Crdb mobile money', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        UnitOfMeasure::insert([
            ['name' => 'mg', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Btl', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Drops', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tube', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kit', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Box', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ltr', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cap', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tin', 'created_at' => $now, 'updated_at' => $now],
        ]);

        ItemType::insert([
            ['name' => 'Service', 'description' => 'Serviced Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmaceutical', 'description' => 'Pharmaceutical and Consumable Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Materials', 'description' => 'Dental consumable materials', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Prosthetics', 'description' => 'Dental prosthetic items (crowns, bridges, dentures)', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);

        Preference::insert([
            ['clinic_id' => 1, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
            ['clinic_id' => 1, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya ya meno yako. Wasiliana nasi 0676 506 323.'],
            ['clinic_id' => 1, 'key' => 'SEND_MESSAGES', 'value' => 'No'],
            ['clinic_id' => 1, 'key' => 'SEND_REMINDER_MESSAGES_AT', 'value' => '11:00'],
            ['clinic_id' => 1, 'key' => 'SMS_SENDER_NAME', 'value' => 'INFO'],
            ['clinic_id' => 1, 'key' => 'MARKETING_MODULE', 'value' => 'Yes'],
        ]);

        // Reference/dropdown options (gender, tooth numbers, anaesthesia types,
        // oral exam findings, etc.) required for forms throughout the system.
        $this->call(OptionsSeeder::class);
    }
}