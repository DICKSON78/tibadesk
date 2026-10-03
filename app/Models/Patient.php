<?php

namespace App\Models;

use App\Enums\Module;
use App\Support\Tenancy\BelongsToFacility;
use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $facility_id
 * @property string $patient_number
 */
class Patient extends Model
{
    use BelongsToFacility;

    /** @use HasFactory<PatientFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'facility_id',
        'patient_number',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        'address',
        'next_of_kin_name',
        'next_of_kin_phone',
        'next_of_kin_relationship',
        'notes',
        'is_deceased',
        'deceased_at',
        'registered_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_deceased' => 'boolean',
            'deceased_at' => 'datetime',
        ];
    }

    public function encounters(): HasMany
    {
        return $this->hasMany(Encounter::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    /**
     * The name as it should be printed on a patient document, without the
     * title-casing the storage layer would otherwise do on every read.
     */
    public function fullName(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])));
    }

    public function ageInYears(): ?int
    {
        return $this->date_of_birth?->age;
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%'.str_replace('%', '\%', $term).'%';

        return $query->where(function (Builder $builder) use ($like): void {
            $builder->where('patient_number', 'like', $like)
                ->orWhere('first_name', 'like', $like)
                ->orWhere('last_name', 'like', $like)
                ->orWhere('phone', 'like', $like);
        });
    }

    /**
     * Whether this facility may register patients. Exposed as a method so the
     * rule can be asked without an HTTP request, which keeps it testable.
     */
    public function canRegisterPatients(): bool
    {
        return $this->hasModule(Module::Registration);
    }
}
