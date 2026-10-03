<?php

namespace App\Models;

use App\Enums\Module;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int|null $facility_id
 * @property Role $role
 * @property bool $is_active
 */
#[Fillable(['facility_id', 'name', 'email', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'is_active' => 'boolean',
        ];
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    /**
     * KADETECH platform staff, who sit above every facility. They are not
     * clinicians: giving them a clinical capability would let a support
     * engineer read a patient's record, so the two ideas stay separate.
     */
    public function isPlatformStaff(): bool
    {
        return $this->facility_id === null;
    }

    /**
     * Whether this account may work at all right now.
     */
    public function canWork(): bool
    {
        if (! $this->is_active || $this->isPlatformStaff()) {
            return false;
        }

        return $this->facility?->status->allowsWork() ?? false;
    }

    /**
     * Two independent gates, both required: the role has to carry the
     * capability, and the facility has to hold the module the capability
     * belongs to. A cashier in a clinic without the billing module can do
     * nothing with billing, and a clinician cannot dispense.
     *
     * Named canPerform rather than can because can() is already taken by
     * Illuminate\Foundation\Auth\User and redeclaring it with a narrower
     * signature is a fatal error, not an override.
     */
    public function canPerform(string $capability, ?Module $module = null): bool
    {
        if (! $this->canWork() || ! $this->role->can($capability)) {
            return false;
        }

        return $module === null || $this->facility?->hasModule($module) === true;
    }

    public function canCompleteConsultations(): bool
    {
        return $this->canPerform('consultations.complete', Module::Consultation);
    }
}
