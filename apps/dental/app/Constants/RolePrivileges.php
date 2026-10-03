<?php

namespace App\Constants;

class RolePrivileges
{
    const ROLES = [
        'Admin' => [
            'label' => 'Administrator',
            'privileges' => [
                'dashboard', 'reception', 'payment_center', 'consultation_room',
                'dental_lab', 'medicine_center', 'procedure_room', 'dispensing',
                'other_dispensing', 'inventory_management', 'marketing',
                'financial_management', 'user_management', 'settings',
            ],
        ],
        'Hospital Manager' => [
            'label' => 'Hospital/Clinic Manager',
            'privileges' => [
                'reception', 'payment_center', 'consultation_room',
                'dental_lab', 'medicine_center', 'procedure_room', 'dispensing',
                'other_dispensing', 'inventory_management', 'marketing',
                'financial_management', 'user_management', 'settings',
            ],
        ],

        // Clinical roles
        'Dental Surgeon' => [
            'label' => 'Dental Surgeon',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab', 'procedure_room',
            ],
        ],
        'Doctor' => [
            'label' => 'Doctor',
            'privileges' => [
                'consultation_room', 'dental_lab',
            ],
        ],
        'Dental Therapist' => [
            'label' => 'Dental Therapist',
            'privileges' => [
                'consultation_room', 'dental_lab',
            ],
        ],
        'Oral Health Officer' => [
            'label' => 'Oral Health Officer',
            'privileges' => [
                'consultation_room', 'dental_lab',
            ],
        ],
        'Clinical Officer' => [
            'label' => 'Clinical Officer',
            'privileges' => [
                'consultation_room', 'procedure_room',
            ],
        ],
        'Medical Officer' => [
            'label' => 'Medical Officer',
            'privileges' => [
                'consultation_room', 'procedure_room', 'medicine_center',
            ],
        ],

        // Nursing roles
        'Nurse' => [
            'label' => 'Nurse',
            'privileges' => [
                'consultation_room', 'procedure_room',
            ],
        ],
        'Dental Nurse' => [
            'label' => 'Dental Nurse',
            'privileges' => [
                'consultation_room', 'dental_lab', 'procedure_room',
            ],
        ],
        'Theatre Nurse' => [
            'label' => 'Theatre Nurse',
            'privileges' => [
                'procedure_room', 'consultation_room',
            ],
        ],
        'Anaesthesia Officer' => [
            'label' => 'Anaesthesia Officer',
            'privileges' => [
                'procedure_room',
            ],
        ],
        'Dental Assistant' => [
            'label' => 'Dental Assistant',
            'privileges' => [
                'consultation_room', 'dental_lab',
            ],
        ],

        // Lab roles
        'Dental Lab Technician' => [
            'label' => 'Dental Lab Technician',
            'privileges' => [
                'dental_lab',
            ],
        ],
        'Lab Assistant' => [
            'label' => 'Lab Assistant',
            'privileges' => [
                'dental_lab',
            ],
        ],

        // Pharmacy roles
        'Pharmacist' => [
            'label' => 'Pharmacist',
            'privileges' => [
                'medicine_center', 'dispensing', 'inventory_management',
            ],
        ],
        'Pharmacy Technician' => [
            'label' => 'Pharmacy Technician',
            'privileges' => [
                'medicine_center', 'dispensing',
            ],
        ],
        'Dispensing Assistant' => [
            'label' => 'Dispensing Assistant',
            'privileges' => [
                'dispensing', 'other_dispensing',
            ],
        ],

        // Administrative roles
        'Receptionist' => [
            'label' => 'Receptionist',
            'privileges' => [
                'reception',
            ],
        ],
        'Medical Records Officer' => [
            'label' => 'Medical Records Officer',
            'privileges' => [
                'reception', 'settings',
            ],
        ],
        'Office Administrator' => [
            'label' => 'Office Administrator',
            'privileges' => [
                'reception', 'settings', 'user_management',
            ],
        ],
        'Secretary' => [
            'label' => 'Secretary',
            'privileges' => [
                'reception',
            ],
        ],
        'Health Information Officer' => [
            'label' => 'Health Information Officer',
            'privileges' => [
                'reception', 'consultation_room',
            ],
        ],

        // Finance roles
        'Cashier' => [
            'label' => 'Cashier',
            'privileges' => [
                'payment_center', 'dispensing', 'other_dispensing',
            ],
        ],
        'Billing Officer' => [
            'label' => 'Billing Officer',
            'privileges' => [
                'payment_center', 'financial_management',
            ],
        ],
        'Accountant' => [
            'label' => 'Accountant',
            'privileges' => [
                'financial_management', 'payment_center',
            ],
        ],

        // Inventory/Store roles
        'Inventory Manager' => [
            'label' => 'Inventory Manager',
            'privileges' => [
                'inventory_management', 'medicine_center',
            ],
        ],
        'Store Keeper' => [
            'label' => 'Store Keeper',
            'privileges' => [
                'inventory_management',
            ],
        ],

        // Outreach/Marketing roles
        'Marketing Officer' => [
            'label' => 'Marketing Officer',
            'privileges' => [
                'marketing',
            ],
        ],
        'Community Oral Health Worker' => [
            'label' => 'Community Oral Health Worker',
            'privileges' => [
                'marketing', 'reception',
            ],
        ],
        'Public Health Officer' => [
            'label' => 'Public Health Officer',
            'privileges' => [
                'marketing', 'consultation_room',
            ],
        ],

        // Oversight roles
        'Quality Assurance Officer' => [
            'label' => 'Quality Assurance Officer',
            'privileges' => [
                'settings',
            ],
        ],
        'Compliance Officer' => [
            'label' => 'Compliance Officer',
            'privileges' => [
                'financial_management', 'settings',
            ],
        ],
        'Training Coordinator' => [
            'label' => 'Training/CME Coordinator',
            'privileges' => [
                'settings',
            ],
        ],

        // IT roles
        'IT Administrator' => [
            'label' => 'IT Administrator',
            'privileges' => [
                'settings', 'user_management',
            ],
        ],
        'System Administrator' => [
            'label' => 'System Administrator',
            'privileges' => [
                'settings', 'user_management',
            ],
        ],
    ];

    public static function getPrivilegesForRole(string $role): array
    {
        return self::ROLES[$role]['privileges'] ?? [];
    }

    public static function getRoleLabels(): array
    {
        return array_map(fn($config) => $config['label'], self::ROLES);
    }

    public static function getRoleKeys(): array
    {
        return array_keys(self::ROLES);
    }
}
