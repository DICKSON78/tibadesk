<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Database\Factories\FacilityRegistrationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $reference
 * @property RegistrationStatus $status
 */
class FacilityRegistration extends Model
{
    /** @use HasFactory<FacilityRegistrationFactory> */
    use HasFactory;

    /**
     * The password hash is never useful to a reader of the API or a
     * forgotten `dd()`, and it has no business in a JSON payload.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'reference',
        'facility_name',
        'facility_type',
        'edition',
        'licence_term',
        'months',
        'contact_name',
        'contact_email',
        'contact_phone',
        'username',
        'password',
        'status',
        'notes',
        'ip_address',
        'user_agent',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'months' => 'integer',
        ];
    }
}
