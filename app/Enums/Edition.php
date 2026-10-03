<?php

namespace App\Enums;

enum Edition: string
{
    case DentalClinic = 'dental-clinic';
    case EyeClinic = 'eye-clinic';
    case Pharmacy = 'pharmacy';
    case Polyclinic = 'polyclinic';
    case Hospital = 'hospital';

    public function label(): string
    {
        return config('tibadesk.editions')[$this->value]['name'] ?? $this->value;
    }

    public function tagline(): string
    {
        return config('tibadesk.editions')[$this->value]['tagline'] ?? '';
    }

    /**
     * The modules a facility is entitled to when it is provisioned on this
     * edition.
     *
     * @return list<Module>
     */
    public function modules(): array
    {
        $keys = config('tibadesk.editions')[$this->value]['modules'] ?? [];

        return array_values(array_filter(
            array_map(Module::from(...), $keys),
        ));
    }

    /**
     * The modules that make this edition what it is, as opposed to the shared
     * clinical core every edition carries.
     *
     * The website's catalogue and the two enums are written separately and
     * must agree, so this is asserted rather than assumed: a dental clinic
     * that quietly started granting the eye module would be a support
     * incident, not a nicety.
     *
     * @return list<Module>
     */
    public function specialistModules(): array
    {
        return match ($this) {
            self::DentalClinic => [Module::Dental],
            self::EyeClinic => [Module::Eye],
            self::Pharmacy, self::Polyclinic, self::Hospital => [],
        };
    }

    /**
     * The clinical core every edition includes, whether or not the catalogue
     * entry says so.
     *
     * @return list<Module>
     */
    public function sharedCore(): array
    {
        return [Module::Registration, Module::Consultation];
    }
}
