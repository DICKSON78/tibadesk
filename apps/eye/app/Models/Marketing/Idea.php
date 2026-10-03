<?php

namespace App\Models\Marketing;

use App\Models\User;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Idea extends Model
{
    use HasFactory;

    protected $fillable = [
        'description', 'created_by', 'status', 'cancelled_at', 'cancelled_by',
        'implemented_at', 'implemented_by', 'remarks',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime:Y-m-d H:i',
        'implemented_at' => 'datetime:Y-m-d H:i',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function implementer()
    {
        return $this->belongsTo(User::class, 'implemented_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
