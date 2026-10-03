<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $term = config('tibadesk.licence_term');

        Schema::table('subscription_orders', function (Blueprint $table) use ($term) {
            $table->string('licence_term', 16)->default($term['key'])->after('edition');
            $table->unsignedSmallInteger('licence_months')->default($term['months'])->after('licence_term');

            $table->timestamp('quoted_at')->nullable()->after('amount');
            $table->string('quoted_by')->nullable()->after('quoted_at');
            $table->text('quote_note')->nullable()->after('quoted_by');
        });

        // A subscription starts life as an enquiry. The amount only exists once
        // the team has quoted it, so the column has to allow being empty.
        Schema::table('subscription_orders', function (Blueprint $table) {
            $table->unsignedInteger('amount')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('subscription_orders')->whereNull('amount')->update(['amount' => 0]);

        Schema::table('subscription_orders', function (Blueprint $table) {
            $table->unsignedInteger('amount')->nullable(false)->change();

            $table->dropColumn(['licence_term', 'licence_months', 'quoted_at', 'quoted_by', 'quote_note']);
        });
    }
};
