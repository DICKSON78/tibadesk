<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Constants\RolePrivileges;
use App\Models\Clinic;
use App\Models\ConsultationType;
use App\Models\ItemType;
use App\Models\JobTitle;
use App\Models\Patient;
use App\Models\PaymentChannel;
use App\Models\PaymentMode;
use App\Models\Preference;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\UserPrivilege;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        $now = Carbon::now()->toDateTimeString();

        $this->seedIfEmpty(Clinic::class, [
            [
                'name' => 'SmartSoft Clinic',
                'phone' => '076855364',
                'email' => 'smartsoft@gmail.com',
                'address' => 'P. O. Box 879 DSM',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->seedIfEmpty(JobTitle::class, [
            ['clinic_id' => 1, 'name' => 'Receptionist', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cashier', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->seedIfEmpty(User::class, [
            [
                'clinic_id' => 1,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role' => 'Admin',
                'designation' => null,
                'username' => 'admin',
                'password' => Hash::make('1234'),
                'gender' => 'Male',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Cashier',
                'last_name' => 'User',
                'role' => 'Cashier',
                'designation' => null,
                'username' => 'cashier',
                'password' => Hash::make('1234'),
                'gender' => 'Female',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Receptionist',
                'last_name' => 'User',
                'role' => 'Receptionist',
                'designation' => null,
                'username' => 'receptionist',
                'password' => Hash::make('1234'),
                'gender' => 'Female',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Doctor',
                'last_name' => 'User',
                'role' => 'Doctor',
                'designation' => 'Doctor',
                'username' => 'doctor',
                'password' => Hash::make('1234'),
                'gender' => 'Male',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Assign privileges based on role
        $users = User::all();
        foreach ($users as $user) {
            $privileges = RolePrivileges::getPrivilegesForRole($user->role);
            if (! empty($privileges) && ! $user->privileges()->exists()) {
                $rows = array_map(fn ($p) => ['user_id' => $user->id, 'privilege' => $p], $privileges);
                UserPrivilege::insert($rows);
            }
        }

        $this->seedIfEmpty(ConsultationType::class, [
            ['name' => 'Pharmacy', 'code' => 'pharmacy', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Lab', 'code' => 'dental_lab', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Procedure', 'code' => 'procedure', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'code' => 'others', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->seedIfEmpty(PaymentMode::class, [
            ['clinic_id' => 1, 'name' => 'Cash', 'code' => 'cash', 'transaction_type' => 'Cash', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'code' => 'credit', 'transaction_type' => 'Credit', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Create default payment channels (parity with live install's 10 channels)
        $this->seedIfEmpty(PaymentChannel::class, [
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

        $this->seedIfEmpty(UnitOfMeasure::class, [
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

        $this->seedIfEmpty(ItemType::class, [
            ['name' => 'Service', 'description' => 'Serviced Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmaceutical', 'description' => 'Pharmaceutical and Consumable Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Materials', 'description' => 'Dental consumable materials', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Prosthetics', 'description' => 'Dental prosthetic items (crowns, bridges, dentures)', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->seedIfEmpty(Preference::class, [
            ['clinic_id' => 1, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
            ['clinic_id' => 1, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya ya meno yako. Wasiliana nasi 0676 506 323.'],
            ['clinic_id' => 1, 'key' => 'SEND_MESSAGES', 'value' => 'No'],
            ['clinic_id' => 1, 'key' => 'SEND_REMINDER_MESSAGES_AT', 'value' => '11:00'],
            ['clinic_id' => 1, 'key' => 'SMS_SENDER_NAME', 'value' => 'INFO'],
            ['clinic_id' => 1, 'key' => 'MARKETING_MODULE', 'value' => 'Yes'],
        ]);

        // Add sample patients
        $this->seedIfEmpty(Patient::class, [
            [
                'first_name' => 'Alice',
                'last_name' => 'Johnson',
                'phone' => '0712345678',
                'gender' => 'Female',
                'date_of_birth' => '1985-03-15',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Bob',
                'last_name' => 'Williams',
                'phone' => '0723456789',
                'gender' => 'Male',
                'date_of_birth' => '1978-07-22',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'Carol',
                'last_name' => 'Brown',
                'phone' => '0734567890',
                'gender' => 'Female',
                'date_of_birth' => '1992-11-08',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Davis',
                'phone' => '0745678901',
                'gender' => 'Male',
                'date_of_birth' => '1980-05-12',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

    }

    /**
     * Only fill a table that is still empty.
     *
     * The migrations already seed the default clinic, job titles, demo users,
     * their privileges and every reference table. This seeder predates that, so
     * on a freshly migrated database it used to abort on the first duplicate key
     * long before it reached the sample patients, and the one bug it always got
     * to was writing a clinic_id onto patients, a column that has never existed.
     */
    private function seedIfEmpty(string $model, array $rows): void
    {
        if ($model::query()->exists()) {
            return;
        }

        $model::insert($rows);
    }
}
