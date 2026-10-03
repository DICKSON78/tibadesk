<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Enable marketing module in preferences
        DB::table('preferences')
            ->where('key', 'MARKETING_MODULE')
            ->update(['value' => 'Yes']);

        // Add marketing privilege to existing admin users
        $adminUsers = DB::table('users')->where('username', 'admin')->get();
        
        foreach ($adminUsers as $user) {
            // Check if marketing privilege already exists
            $exists = DB::table('user_privileges')
                ->where('user_id', $user->id)
                ->where('privilege', 'marketing')
                ->exists();
            
            if (!$exists) {
                DB::table('user_privileges')->insert([
                    'user_id' => $user->id,
                    'privilege' => 'marketing',
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Disable marketing module in preferences
        DB::table('preferences')
            ->where('key', 'MARKETING_MODULE')
            ->update(['value' => 'No']);

        // Remove marketing privilege from users
        DB::table('user_privileges')
            ->where('privilege', 'marketing')
            ->delete();
    }
};
