<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->after('id');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->after('middle_name');
            $table->foreignId('department_id')->nullable()->after('last_name');
            $table->foreignId('job_title_id')->nullable()->after('department_id');
            $table->string('employee_number')->nullable()->after('job_title_id');
            $table->date('date_of_birth')->nullable()->after('employee_number');
            $table->enum('gender', ['Male', 'Female'])->nullable()->after('date_of_birth');
            $table->string('national_id')->nullable()->after('gender');
            $table->string('phone')->nullable()->after('national_id');

            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('job_title_id')
                ->references('id')
                ->on('job_titles')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });

        DB::beginTransaction();

        try {
            DB::statement('update users as u inner join employees as e on e.user_id = u.id set u.first_name = e.first_name, u.middle_name = e.middle_name, u.last_name = e.last_name, u.department_id = e.department_id, u.job_title_id = e.job_title_id, u.employee_number = e.employee_number, u.date_of_birth = e.date_of_birth, u.gender = e.gender, u.national_id = e.national_id, u.phone = e.phone');

            Schema::table('patient_payment_cache_items', function (Blueprint $table) {
                $table->dropForeign('patient_payment_cache_items_consultant_id_foreign');
            });

            DB::statement('update patient_payment_cache_items as ppci inner join employees as e on ppci.consultant_id = e.id set ppci.consultant_id = e.user_id');

            Schema::table('patient_payment_cache_items', function (Blueprint $table) {
                $table->foreign('consultant_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnUpdate()
                    ->nullOnDelete();
            });

            DB::statement('drop table employees');

            DB::commit();
        } catch (\Exception $e) {
            Log::debug($e);
            DB::rollBack();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
