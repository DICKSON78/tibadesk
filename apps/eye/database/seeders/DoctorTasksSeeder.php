<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use App\Models\DoctorTask;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorTasksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now()->toDateTimeString();

        // Check if clinic exists, if not create it
        $clinic = Clinic::firstOrCreate(
            ['name' => 'SmartSoft Clinic'],
            [
                'phone' => '076855364',
                'email' => 'smartsoft@gmail.com',
                'address' => 'P. O. Box 879 DSM',
                'created_at' => $now,
                'updated_at' => $now
            ]
        );

        // Add doctor users if they don't exist
        $doctors = [
            [
                'clinic_id' => $clinic->id,
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
                'clinic_id' => $clinic->id,
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
                'clinic_id' => $clinic->id,
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'role' => 'Doctor',
                'designation' => 'Optometrist',
                'username' => 'doctor3',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($doctors as $doctorData) {
            User::firstOrCreate(
                ['username' => $doctorData['username']],
                $doctorData
            );
        }

        // Add sample patients if they don't exist
        $patients = [
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
        ];

        foreach ($patients as $patientData) {
            Patient::firstOrCreate(
                ['phone' => $patientData['phone']],
                $patientData
            );
        }

        // Get the created users and patients
        $doctor1 = User::where('username', 'doctor1')->first();
        $doctor2 = User::where('username', 'doctor2')->first();
        $doctor3 = User::where('username', 'doctor3')->first();
        $admin = User::where('username', 'admin')->first();

        $patient1 = Patient::where('phone', '0712345678')->first();
        $patient2 = Patient::where('phone', '0723456789')->first();
        $patient3 = Patient::where('phone', '0734567890')->first();
        $patient4 = Patient::where('phone', '0745678901')->first();

        // Add sample doctor tasks
        $tasks = [
            [
                'doctor_id' => $doctor1->id,
                'patient_id' => $patient1->id,
                'task_type' => 'Consultation',
                'treatment_details' => 'Eye examination and prescription for glasses',
                'status' => 'completed',
                'assigned_at' => now()->subDays(2),
                'started_at' => now()->subDays(2)->addMinutes(30),
                'completed_at' => now()->subDays(2)->addMinutes(45),
                'assigned_by' => $admin->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => $doctor1->id,
                'patient_id' => $patient2->id,
                'task_type' => 'Procedure',
                'treatment_details' => 'Cataract surgery consultation',
                'status' => 'in_progress',
                'assigned_at' => now()->subHours(2),
                'started_at' => now()->subHour(),
                'assigned_by' => $admin->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => $doctor2->id,
                'patient_id' => $patient3->id,
                'task_type' => 'Follow-up',
                'treatment_details' => 'Post-surgery follow-up examination',
                'status' => 'pending',
                'assigned_at' => now()->addHours(1),
                'assigned_by' => $admin->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => $doctor3->id,
                'patient_id' => $patient4->id,
                'task_type' => 'Consultation',
                'treatment_details' => 'Routine eye check-up',
                'status' => 'completed',
                'assigned_at' => now()->subDays(1),
                'started_at' => now()->subDays(1)->addMinutes(15),
                'completed_at' => now()->subDays(1)->addMinutes(30),
                'assigned_by' => $admin->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => $doctor2->id,
                'patient_id' => $patient1->id,
                'task_type' => 'Procedure',
                'treatment_details' => 'Laser eye treatment',
                'status' => 'pending',
                'assigned_at' => now()->addDays(1),
                'assigned_by' => $admin->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($tasks as $taskData) {
            DoctorTask::firstOrCreate(
                [
                    'doctor_id' => $taskData['doctor_id'],
                    'patient_id' => $taskData['patient_id'],
                    'task_type' => $taskData['task_type'],
                    'assigned_at' => $taskData['assigned_at'],
                ],
                $taskData
            );
        }

        echo "Doctor tasks seeder completed successfully!\n";
        echo "Created " . User::doctors()->count() . " doctor users\n";
        echo "Created " . Patient::count() . " patients\n";
        echo "Created " . DoctorTask::count() . " doctor tasks\n";
    }
}
