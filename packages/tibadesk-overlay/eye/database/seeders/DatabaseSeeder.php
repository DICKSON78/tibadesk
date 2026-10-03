<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\ConsultationType;
use App\Models\DoctorTask;
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

        $this->seedMissingUsers([
            'clinic_id' => 1,
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'username' => 'admin',
            'password' => Hash::make('1234'),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Add doctor users
        $this->seedMissingUsers([
            [
                'clinic_id' => 1,
                'first_name' => 'John',
                'last_name' => 'Doe',
                'role' => 'Doctor',
                'designation' => 'General Physician',
                'username' => 'doctor1',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'role' => 'Doctor',
                'designation' => 'Ophthalmologist',
                'username' => 'doctor2',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'role' => 'Doctor',
                'designation' => 'Optometrist',
                'username' => 'doctor3',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $this->seedIfEmpty(UserPrivilege::class, [
            ['user_id' => 1, 'privilege' => 'dashboard'],
            ['user_id' => 1, 'privilege' => 'reception'],
            ['user_id' => 1, 'privilege' => 'payment_center'],
            ['user_id' => 1, 'privilege' => 'consultation_room'],
            ['user_id' => 1, 'privilege' => 'optician_center'],
            ['user_id' => 1, 'privilege' => 'medicine_center'],
            ['user_id' => 1, 'privilege' => 'procedure_room'],
            ['user_id' => 1, 'privilege' => 'other_dispensing'],
            ['user_id' => 1, 'privilege' => 'inventory_management'],
            ['user_id' => 1, 'privilege' => 'marketing'],
            ['user_id' => 1, 'privilege' => 'financial_management'],
            ['user_id' => 1, 'privilege' => 'user_management'],
            ['user_id' => 1, 'privilege' => 'settings'],
        ]);

        $this->seedIfEmpty(ConsultationType::class, [
            ['name' => 'Pharmacy', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Glass', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Procedure', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->seedIfEmpty(PaymentMode::class, [['clinic_id' => 1, 'name' => 'Cash', 'transaction_type' => 'Cash', 'created_at' => $now, 'updated_at' => $now]]);

        // Create default payment channels
        $this->seedIfEmpty(PaymentChannel::class, [
            ['clinic_id' => 1, 'name' => 'Cash', 'description' => 'Cash payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'description' => 'Credit payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Bank Transfer', 'description' => 'Bank transfer payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
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
            ['name' => 'Lens', 'description' => 'Lens Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Frame', 'description' => 'Frame Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $this->seedIfEmpty(Preference::class, [
            ['clinic_id' => 1, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
            ['clinic_id' => 1, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya ya macho yako. Wasiliana nasi 0676 506 323.'],
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

        $this->call(CategorySeeder::class);
        $this->call(BlogPostSeeder::class);
        $this->call(AnnouncementSeeder::class);

        // Add sample doctor tasks
        $this->seedIfEmpty(DoctorTask::class, [
            [
                'doctor_id' => 2, // Dr. John Doe
                'patient_id' => 1, // Alice Johnson
                'task_type' => 'Consultation',
                'treatment_details' => 'Eye examination and prescription for glasses',
                'status' => 'completed',
                'assigned_at' => now()->subDays(2),
                'started_at' => now()->subDays(2)->addMinutes(30),
                'completed_at' => now()->subDays(2)->addMinutes(45),
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 2, // Dr. John Doe
                'patient_id' => 2, // Bob Williams
                'task_type' => 'Procedure',
                'treatment_details' => 'Cataract surgery consultation',
                'status' => 'in_progress',
                'assigned_at' => now()->subHours(2),
                'completed_at' => null,
                'started_at' => now()->subHour(),
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 3, // Dr. Jane Smith
                'patient_id' => 3, // Carol Brown
                'task_type' => 'Follow-up',
                'treatment_details' => 'Post-surgery follow-up examination',
                'status' => 'pending',
                'assigned_at' => now()->addHours(1),
                'started_at' => null,
                'completed_at' => null,
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 4, // Dr. Michael Johnson
                'patient_id' => 4, // David Davis
                'task_type' => 'Consultation',
                'treatment_details' => 'Routine eye check-up',
                'status' => 'completed',
                'assigned_at' => now()->subDays(1),
                'started_at' => now()->subDays(1)->addMinutes(15),
                'completed_at' => now()->subDays(1)->addMinutes(30),
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 3, // Dr. Jane Smith
                'patient_id' => 1, // Alice Johnson
                'task_type' => 'Procedure',
                'treatment_details' => 'Laser eye treatment',
                'status' => 'pending',
                'assigned_at' => now()->addDays(1),
                'started_at' => null,
                'completed_at' => null,
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    /**
     * Only fill a table that is still empty.
     *
     * The migrations already seed the default clinic, job titles, demo users and
     * every reference table, so on a migrated database this seeder used to abort
     * on the first duplicate key and never reach the sample patients and doctor
     * tasks at the end.
     */
    private function seedIfEmpty(string $model, array $rows): void
    {
        if ($model::query()->exists()) {
            return;
        }

        $model::insert($rows);
    }

    /**
     * Insert only the demo users that are not already there.
     *
     * A blanket "users table is empty" guard was wrong here. The migrations
     * create a single admin, so skipping the block wholesale would leave the
     * demo doctors missing while the sample doctor tasks below still reference
     * them by id. Keying on username lets a partly seeded database fill in the
     * rest without duplicating whoever is already there.
     */
    private function seedMissingUsers(array $rows): void
    {
        $candidates = array_is_list($rows) ? $rows : [$rows];

        $existing = User::query()->pluck('username')->all();

        $missing = array_values(array_filter(
            $candidates,
            fn (array $row) => ! in_array($row['username'] ?? null, $existing, true)
        ));

        if ($missing === []) {
            return;
        }

        User::insert($missing);
    }
}
