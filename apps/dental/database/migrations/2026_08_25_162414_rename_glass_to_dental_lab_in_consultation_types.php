<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Rename Glass → Dental Lab in consultation_types
        DB::table('consultation_types')
            ->where('name', 'Glass')
            ->update(['name' => 'Dental Lab']);

        // Rename Lens → Dental Materials in item_types
        DB::table('item_types')
            ->where('name', 'Lens')
            ->update(['name' => 'Dental Materials']);

        // Rename Frame → Dental Prosthetics in item_types
        DB::table('item_types')
            ->where('name', 'Frame')
            ->update(['name' => 'Dental Prosthetics']);

        // Update any existing items that reference Lens or Frame consultation type
        $dentalLabId = DB::table('consultation_types')->where('name', 'Dental Lab')->value('id');
        if ($dentalLabId) {
            // Items previously associated with Glass consultation type should now use Dental Lab
            // This is handled by the FK, so no update needed if the ID changed
        }

        // Update patient_direction values from Direct to Optician → Direct to Dental Lab
        //
        // Guarded because this runs before the migration that creates the column:
        // no migration in this package ever added it, so on a database migrated
        // from the original consultation schema it is not there yet and there is
        // nothing to rename. The later migration creates it and performs the
        // same rename as part of widening the enum.
        if (Schema::hasColumn('consultations', 'patient_direction')) {
            DB::table('consultations')
                ->where('patient_direction', 'Direct to Optician')
                ->update(['patient_direction' => 'Direct to Dental Lab']);
        }
    }

    public function down()
    {
        DB::table('consultation_types')
            ->where('name', 'Dental Lab')
            ->update(['name' => 'Glass']);

        DB::table('item_types')
            ->where('name', 'Dental Materials')
            ->update(['name' => 'Lens']);

        DB::table('item_types')
            ->where('name', 'Dental Prosthetics')
            ->update(['name' => 'Frame']);

        DB::table('consultations')
            ->where('patient_direction', 'Direct to Dental Lab')
            ->update(['patient_direction' => 'Direct to Optician']);
    }
};
