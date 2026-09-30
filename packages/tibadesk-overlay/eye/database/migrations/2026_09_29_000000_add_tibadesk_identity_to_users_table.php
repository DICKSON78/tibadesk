<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // TibaDesk mounts this application and signs users in from its own
        // session, so a user here has to remember which TibaDesk account they
        // arrived as. The email cannot serve as that link: it is editable in
        // both applications, and a user who changes it in one would otherwise
        // come back as somebody else, or as nobody at all.
        //
        // Nullable and unique because local sign-ins still exist and must keep
        // working — a user who has never come through TibaDesk simply has no
        // external identity.
        if (! Schema::hasColumn('users', 'tibadesk_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('tibadesk_id')->nullable()->unique()->after('id');
            });
        }

        if (! Schema::hasColumn('users', 'tibadesk_synced_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('tibadesk_synced_at')->nullable()->after('tibadesk_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tibadesk_id', 'tibadesk_synced_at']);
        });
    }
};
