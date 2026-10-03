<?php

namespace App\Models\Marketing;

use App\Models\User;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingStrategy extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'overview', 'goals', 'target_audience', 'budget', 'channels', 'created_by', 'status',
        'cancelled_at', 'cancelled_by', 'closed_at', 'closed_by', 'remarks',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime:Y-m-d H:i',
        'closed_at' => 'datetime:Y-m-d H:i',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function closer()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
