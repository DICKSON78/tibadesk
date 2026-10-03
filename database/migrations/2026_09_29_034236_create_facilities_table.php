<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();

            // What was sold. The modules actually granted live in
            // facility_modules, because a facility can hold modules its
            // edition does not name.
            $table->string('edition', 40)->index();
            $table->string('licence_term', 40)->nullable();
            $table->unsignedSmallInteger('licence_months')->nullable();
            $table->dateTime('licence_expires_at')->nullable();

            $table->string('status', 32)->default('pending')->index();

            // Carried from the website registration so the facility keeps the
            // reference it was issued and the team can trace one to the other.
            $table->string('registration_reference', 24)->nullable()->unique();
            $table->string('facility_type', 40)->nullable();

            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('address')->nullable();
            $table->string('logo')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
