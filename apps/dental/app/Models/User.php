<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Constants\RolePrivileges;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['full_name', 'is_admin'];

    protected $fillable = [
        'clinic_id', 'first_name', 'middle_name', 'last_name', 'designation', 'department_id', 'job_title_id',
        'employee_number', 'date_of_birth', 'gender', 'national_id', 'phone', 'email', 'username', 'password', 'role',
        'created_by', 'status',

        // The TibaDesk identity a single sign-on user arrives with. Both are
        // mass-assignable because the sign-in path provisions a user from a
        // request payload; leaving them out of this list would silently drop
        // them and provision a new, unlinked account on every sign-in.
        'tibadesk_id', 'tibadesk_synced_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function job_title()
    {
        return $this->belongsTo(JobTitle::class, 'job_title_id');
    }

    public function privileges()
    {
        return $this->hasMany(UserPrivilege::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function patient_waiting_times()
    {
        return $this->hasMany(PatientWaitingTime::class, 'doctor_id');
    }

    public function getFullNameAttribute()
    {
        $name = sprintf('%s %s %s', $this->first_name, $this->middle_name, $this->last_name);
        return preg_replace('/\s{2,}/', ' ', trim($name));
    }

    public function scopeFullName($query, $value)
    {
        return $query->whereRaw('concat(first_name, coalesce(middle_name, ""), last_name) like ?', [str_replace(' ', '', $value)]);
    }

    public function scopeDoctors($query)
    {
        return $query->where(function ($q) {
            $q->whereRaw('LOWER(role) = ?', ['doctor'])
              ->orWhereRaw('LOWER(designation) LIKE ?', ['%doctor%'])
              ->orWhereRaw('LOWER(designation) LIKE ?', ['%physician%']);
        });
    }

    public function getIsAdminAttribute()
    {
        return $this->role === 'Admin';
    }

    public function hasPrivilege(string $privilege): bool
    {
        if ($this->is_admin) {
            return true;
        }

        return $this->privileges()->where('privilege', $privilege)->exists();
    }

    public function getRolePrivilegesAttribute(): array
    {
        return RolePrivileges::getPrivilegesForRole($this->role);
    }

    public function getIsDoctorAttribute()
    {
        return $this->role == 'Doctor' || 
               stripos($this->designation, 'doctor') !== false || 
               stripos($this->designation, 'physician') !== false;
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}