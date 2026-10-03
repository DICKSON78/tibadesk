<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasWorkflowCode;

class PaymentMode extends Model
{
    use HasFactory;
    use HasWorkflowCode;

    public const CODE_CASH = 'cash';
    public const CODE_CREDIT = 'credit';

    protected $fillable = ['clinic_id', 'name', 'code', 'description', 'transaction_type', 'status'];

    public static function codeAliases(): array
    {
        return [
            self::CODE_CASH => ['Cash'],
            self::CODE_CREDIT => ['Credit'],
        ];
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}