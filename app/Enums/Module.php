<?php

namespace App\Enums;

enum Module: string
{
    case Registration = 'registration';
    case Consultation = 'consultation';
    case Ipd = 'ipd';
    case Pharmacy = 'pharmacy';
    case Laboratory = 'laboratory';
    case Billing = 'billing';
    case Hr = 'hr';
    case Reporting = 'reporting';
    case Licensing = 'licensing';
    case Dental = 'dental';
    case Eye = 'eye';
    case Polyclinic = 'polyclinic';

    public function label(): string
    {
        return config('tibadesk.modules')[$this->value]['name'] ?? $this->value;
    }

    /**
     * Modules that must be present for the clinical core to work at all. An
     * edition without these is not a usable system, so the catalogue test
     * asserts no edition can ship without them.
     */
    public static function core(): array
    {
        return [
            self::Registration,
            self::Consultation,
        ];
    }
}
