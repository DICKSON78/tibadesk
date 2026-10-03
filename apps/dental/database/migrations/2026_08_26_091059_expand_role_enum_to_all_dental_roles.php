<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ExpandRoleEnumToAllDentalRoles extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM(
            'Admin','Hospital Manager',
            'Dental Surgeon','Doctor','Dental Therapist','Oral Health Officer','Clinical Officer','Medical Officer',
            'Nurse','Dental Nurse','Theatre Nurse','Anaesthesia Officer','Dental Assistant',
            'Dental Lab Technician','Lab Assistant',
            'Pharmacist','Pharmacy Technician','Dispensing Assistant',
            'Receptionist','Medical Records Officer','Office Administrator','Secretary','Health Information Officer',
            'Cashier','Billing Officer','Accountant',
            'Inventory Manager','Store Keeper',
            'Marketing Officer','Community Oral Health Worker','Public Health Officer',
            'Quality Assurance Officer','Compliance Officer','Training Coordinator',
            'IT Administrator','System Administrator'
        ) NULL DEFAULT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Doctor','Client') NULL DEFAULT NULL");
    }
}
