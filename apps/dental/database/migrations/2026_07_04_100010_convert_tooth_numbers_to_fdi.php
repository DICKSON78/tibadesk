<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ConvertToothNumbersToFdi extends Migration
{
    public function up()
    {
        $mapping = [
            1 => 18, 2 => 17, 3 => 16, 4 => 15, 5 => 14, 6 => 13, 7 => 12, 8 => 11,
            9 => 21, 10 => 22, 11 => 23, 12 => 24, 13 => 25, 14 => 26, 15 => 27, 16 => 28,
            17 => 38, 18 => 37, 19 => 36, 20 => 35, 21 => 34, 22 => 33, 23 => 32, 24 => 31,
            25 => 41, 26 => 42, 27 => 43, 28 => 44, 29 => 45, 30 => 46, 31 => 47, 32 => 48,
        ];

        foreach ($mapping as $old => $new) {
            DB::table('dental_charting')->where('tooth_number', $old)->update(['tooth_number' => $new]);
            DB::table('dental_treatment_records')->where('tooth_number', $old)->update(['tooth_number' => $new]);
            DB::table('dental_lab_orders')->where('tooth_number', $old)->update(['tooth_number' => $new]);
        }
    }

    public function down()
    {
        $reverse = [
            18 => 1, 17 => 2, 16 => 3, 15 => 4, 14 => 5, 13 => 6, 12 => 7, 11 => 8,
            21 => 9, 22 => 10, 23 => 11, 24 => 12, 25 => 13, 26 => 14, 27 => 15, 28 => 16,
            38 => 17, 37 => 18, 36 => 19, 35 => 20, 34 => 21, 33 => 22, 32 => 23, 31 => 24,
            41 => 25, 42 => 26, 43 => 27, 44 => 28, 45 => 29, 46 => 30, 47 => 31, 48 => 32,
        ];

        foreach ($reverse as $old => $new) {
            DB::table('dental_charting')->where('tooth_number', $old)->update(['tooth_number' => $new]);
            DB::table('dental_treatment_records')->where('tooth_number', $old)->update(['tooth_number' => $new]);
            DB::table('dental_lab_orders')->where('tooth_number', $old)->update(['tooth_number' => $new]);
        }
    }
}
