<?php

namespace App\Models\Marketing;

use App\Models\User;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_date', 'description', 'created_by', 'status', 'cancelled_at', 'cancelled_by',
        'completed_at', 'completed_by', 'remarks',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime:Y-m-d H:i',
        'completed_at' => 'datetime:Y-m-d H:i',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function completer()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
