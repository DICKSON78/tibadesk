<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasWorkflowCode;

class ConsultationType extends Model
{
    use HasFactory;
    use HasWorkflowCode;

    public const CODE_PHARMACY = 'pharmacy';
    public const CODE_DENTAL_LAB = 'dental_lab';
    public const CODE_PROCEDURE = 'procedure';
    public const CODE_OTHERS = 'others';
    public const CODE_GENERAL_CONSULTATION = 'consultation';
    public const CODE_DENTAL = 'dental';

    protected $fillable = ['name', 'code', 'description', 'status'];

    public static function codeAliases(): array
    {
        return [
            self::CODE_PHARMACY => ['Pharmacy'],
            self::CODE_DENTAL_LAB => ['Dental Lab'],
            self::CODE_PROCEDURE => ['Procedure'],
            self::CODE_OTHERS => ['Others'],
            self::CODE_GENERAL_CONSULTATION => ['General Consultation'],
            self::CODE_DENTAL => ['Dental'],
        ];
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}