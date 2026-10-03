<?php

namespace App\Enums;

enum Role: string
{
    case FacilityAdmin = 'facility_admin';
    case Receptionist = 'receptionist';
    case Clinician = 'clinician';
    case Cashier = 'cashier';
    case Pharmacist = 'pharmacist';
    case LabTechnician = 'lab_technician';
    case Dentist = 'dentist';
    case Ophthalmologist = 'ophthalmologist';
    case Nurse = 'nurse';
    case HrOfficer = 'hr_officer';

    public function label(): string
    {
        return match ($this) {
            self::FacilityAdmin => 'Facility administrator',
            self::Receptionist => 'Receptionist',
            self::Clinician => 'Clinician',
            self::Cashier => 'Cashier',
            self::Pharmacist => 'Pharmacist',
            self::LabTechnician => 'Laboratory technician',
            self::Dentist => 'Dentist',
            self::Ophthalmologist => 'Ophthalmologist',
            self::Nurse => 'Nurse',
            self::HrOfficer => 'HR officer',
        };
    }

    /**
     * What this role is allowed to do, independent of which modules the
     * facility holds. A capability is only ever granted on top of a module the
     * facility already has, so the two checks compose rather than overlap.
     *
     * @return list<string>
     */
    public function capabilities(): array
    {
        return match ($this) {
            self::FacilityAdmin => [
                'patients.view', 'patients.register', 'patients.update',
                'encounters.view', 'encounters.create',
                'consultations.view', 'consultations.create', 'consultations.complete',
                'billing.view', 'billing.charge', 'billing.manage',
                'pharmacy.view', 'pharmacy.dispense', 'pharmacy.manage',
                'laboratory.view', 'laboratory.record-results', 'laboratory.manage',
                'dental.view', 'dental.record',
                'eye.view', 'eye.record',
                'ipd.view', 'ipd.admit', 'ipd.discharge', 'ipd.manage',
                'polyclinic.view', 'polyclinic.refer',
                'hr.view', 'hr.manage',
                'licensing.view', 'licensing.manage',
                'reporting.view', 'users.manage', 'facility.manage',
            ],
            self::Receptionist => [
                'patients.view', 'patients.register', 'patients.update',
                'encounters.view', 'encounters.create',
                'consultations.view',
            ],
            self::Clinician => [
                'patients.view', 'patients.update',
                'encounters.view', 'encounters.create',
                'consultations.view', 'consultations.create', 'consultations.complete',
                'pharmacy.view', 'laboratory.view', 'billing.view',
                'polyclinic.view', 'polyclinic.refer',
            ],
            self::Cashier => [
                'patients.view', 'encounters.view',
                'consultations.view',
                'billing.view', 'billing.charge', 'billing.manage',
                'reporting.view',
            ],
            self::Pharmacist => [
                'patients.view', 'pharmacy.view', 'pharmacy.dispense', 'pharmacy.manage',
            ],
            self::LabTechnician => [
                'patients.view', 'laboratory.view', 'laboratory.record-results', 'laboratory.manage',
            ],
            self::Dentist => [
                'patients.view', 'patients.update',
                'encounters.view', 'encounters.create',
                'consultations.view', 'consultations.create', 'consultations.complete',
                'dental.view', 'dental.record',
                'pharmacy.view', 'billing.view', 'polyclinic.view', 'polyclinic.refer',
            ],
            self::Ophthalmologist => [
                'patients.view', 'patients.update',
                'encounters.view', 'encounters.create',
                'consultations.view', 'consultations.create', 'consultations.complete',
                'eye.view', 'eye.record',
                'pharmacy.view', 'billing.view', 'polyclinic.view', 'polyclinic.refer',
            ],
            self::Nurse => [
                'patients.view',
                'encounters.view', 'encounters.create',
                'consultations.view',
                'ipd.view', 'ipd.admit', 'ipd.discharge', 'ipd.manage',
                'polyclinic.view', 'polyclinic.refer',
                'pharmacy.view', 'laboratory.view',
            ],
            self::HrOfficer => [
                'patients.view',
                'encounters.view', 'consultations.view',
                'hr.view', 'hr.manage',
                'reporting.view',
            ],
        };
    }

    /**
     * The module a role only makes sense alongside, if any.
     *
     * A dentist in a clinic without the dental module has capabilities the
     * facility has bought no way to use. The navigation and the staff list use
     * this to say so plainly rather than offering a menu that 403s.
     */
    public function requiresModule(): ?Module
    {
        return match ($this) {
            self::Dentist => Module::Dental,
            self::Ophthalmologist => Module::Eye,
            self::Pharmacist => Module::Pharmacy,
            self::LabTechnician => Module::Laboratory,
            self::Cashier => Module::Billing,
            self::HrOfficer => Module::Hr,
            self::Nurse, self::Clinician, self::Receptionist, self::FacilityAdmin => null,
        };
    }

    public function can(string $capability): bool
    {
        return in_array($capability, $this->capabilities(), true);
    }

    /**
     * Roles permitted to sign a consultation off. Kept here rather than in a
     * request so the rule is testable without an HTTP round trip.
     *
     * @return list<self>
     */
    public static function whoCompletesConsultations(): array
    {
        return [self::Clinician, self::FacilityAdmin];
    }
}
