<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_registrations', function (Blueprint $table): void {
            $table->id();

            // Quoted to the facility, so it is the handle the team and the
            // applicant both use when they talk about this registration.
            $table->string('reference', 24)->unique();

            $table->string('facility_name');
            $table->string('facility_type', 40);

            // An edition key from config('tibadesk.editions') and a term key
            // from config('tibadesk.licence_terms'). The months are copied
            // off the term server-side rather than trusted from the form.
            $table->string('edition', 40);
            $table->string('licence_term', 40);
            $table->unsignedSmallInteger('months');

            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone');

            $table->string('username', 64)->unique();

            // Already hashed on the way in. The account is only created once
            // the team approves, so this is the credential the facility
            // will sign in with.
            $table->string('password');

            $table->string('status', 32)->default('pending');
            $table->text('notes')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('edition');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_registrations');
    }
};
