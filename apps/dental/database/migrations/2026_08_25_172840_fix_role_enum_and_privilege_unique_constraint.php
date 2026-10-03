<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixRoleEnumAndPrivilegeUniqueConstraint extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Doctor','Client') NULL DEFAULT NULL");

        Schema::table('user_privileges', function (Blueprint $table) {
            $table->unique(['user_id', 'privilege']);
        });
    }

    public function down()
    {
        Schema::table('user_privileges', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'privilege']);
        });

        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Client') NULL DEFAULT NULL");
    }
}
