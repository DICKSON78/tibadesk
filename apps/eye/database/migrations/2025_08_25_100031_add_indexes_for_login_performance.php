<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        // Add indexes for better login performance
        Schema::table('users', function (Blueprint $table) {
            // Add index on status for faster user status checks
            $table->index('status');
            
            // Add composite index for username and status (most common login query)
            $table->index(['username', 'status']);
            
            // Add index on department_id for faster joins
            $table->index('department_id');
            
            // Add index on job_title_id for faster joins
            $table->index('job_title_id');
            
            // Add index on clinic_id for faster joins
            $table->index('clinic_id');
        });

        // Add indexes for user privileges table
        Schema::table('user_privileges', function (Blueprint $table) {
            // Add index on user_id for faster privilege lookups
            $table->index('user_id');
            
            // Add composite index for user_id and privilege
            $table->index(['user_id', 'privilege']);
        });

        // Add indexes for preferences table
        Schema::table('preferences', function (Blueprint $table) {
            // Add index on clinic_id for faster preference lookups
            $table->index('clinic_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove indexes
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['username', 'status']);
            $table->dropIndex(['department_id']);
            $table->dropIndex(['job_title_id']);
            $table->dropIndex(['clinic_id']);
        });

        Schema::table('user_privileges', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['user_id', 'privilege']);
        });

        Schema::table('preferences', function (Blueprint $table) {
            $table->dropIndex(['clinic_id']);
        });
    }
};
