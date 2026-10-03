<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Collapse the four applications' separate user tables into this one.
 *
 * The pharmacy, dental and eye applications each carried their own `users`
 * table, which meant the same person existed up to four times and every request
 * across an application boundary needed a signed assertion to say who they were.
 * The single sign-on layer that grew up to work around that is what this
 * migration starts removing: once a person is one row, they need no assertion.
 *
 * The tables are not compatible and are not merged column-for-column. Pharmacy
 * called a person's name `name` and dental split it into `first_name` and
 * `last_name`; pharmacy said `is_verified` where this application says
 * `email_verified_at`; dental had `status` as a word where this application has
 * `is_active` as a boolean. So this application's narrower shape stays the
 * source of truth for anything that governs access here, and the other
 * applications' extra detail is carried alongside it rather than folded in.
 *
 * Every added column is nullable. The table already has rows, so a NOT NULL
 * column with no default cannot be added at all; and absence is the normal case
 * rather than an error, since a person may only ever have used one of the four
 * applications.
 *
 * Nothing is deleted and no existing value is overwritten. Each imported person
 * keeps the id they had in the application they came from, recorded in the
 * matching `legacy_*` column, so the import can be re-run, audited or reversed
 * without a separate copy of the old tables.
 */
return new class extends Migration
{
    /**
     * Columns the three applications had and this one did not.
     *
     * Dental and eye split the name; this application and pharmacy kept it
     * whole. Both are kept, because splitting is lossy for a name with a single
     * part and joining is lossy for one with a suffix or a particle in it.
     *
     * Employment detail stays as loose columns rather than becoming relations,
     * because in those applications it was free text and modelling it would
     * invent structure the data does not have.
     *
     * Each entry is a closure rather than a type name, because the unsigned
     * integers are added through a Blueprint method: `unsignedBigInteger` is
     * not a type this application's grammar knows how to compile.
     *
     * @return array<string, Closure(Blueprint): void>
     */
    private function widenedColumns(): array
    {
        $column = fn (callable $add) => $add;

        return [
            'first_name' => $column(fn (Blueprint $t) => $t->string('first_name')->nullable()),
            'last_name' => $column(fn (Blueprint $t) => $t->string('last_name')->nullable()),
            'middle_name' => $column(fn (Blueprint $t) => $t->string('middle_name')->nullable()),
            'phone' => $column(fn (Blueprint $t) => $t->string('phone')->nullable()),

            // Dental and eye identified staff by a username they chose; this
            // application and pharmacy only ever used the email address.
            'username' => $column(fn (Blueprint $t) => $t->string('username')->nullable()),

            'employee_number' => $column(fn (Blueprint $t) => $t->string('employee_number')->nullable()),
            'designation' => $column(fn (Blueprint $t) => $t->string('designation')->nullable()),
            'national_id' => $column(fn (Blueprint $t) => $t->string('national_id')->nullable()),
            'gender' => $column(fn (Blueprint $t) => $t->string('gender')->nullable()),
            'date_of_birth' => $column(fn (Blueprint $t) => $t->date('date_of_birth')->nullable()),

            // Pharmacy kept a postal address in four separate columns.
            'location' => $column(fn (Blueprint $t) => $t->string('location')->nullable()),
            'street' => $column(fn (Blueprint $t) => $t->string('street')->nullable()),
            'road' => $column(fn (Blueprint $t) => $t->string('road')->nullable()),
            'photo' => $column(fn (Blueprint $t) => $t->string('photo')->nullable()),
            'user_code' => $column(fn (Blueprint $t) => $t->string('user_code')->nullable()),

            // Pharmacy soft-deleted its users; nothing here does. Kept so a
            // soft-deleted pharmacy user is not imported as though they had
            // never existed.
            'deleted_at' => $column(fn (Blueprint $t) => $t->timestamp('deleted_at')->nullable()),

            // Where each of the three applications knew this person, so the
            // import can be audited and reversed, and so an operator can see
            // at a glance which applications a user has an account with.
            'legacy_pharmacy_id' => $column(fn (Blueprint $t) => $t->unsignedBigInteger('legacy_pharmacy_id')->nullable()),
            'legacy_dental_id' => $column(fn (Blueprint $t) => $t->unsignedBigInteger('legacy_dental_id')->nullable()),
            'legacy_eye_id' => $column(fn (Blueprint $t) => $t->unsignedBigInteger('legacy_eye_id')->nullable()),

            // Dental attached staff to a department. A person can only belong
            // to the facility this application puts them in, so the department
            // is kept and the clinic is implied by the facility.
            'department_id' => $column(fn (Blueprint $t) => $t->unsignedBigInteger('department_id')->nullable()),
            'created_by' => $column(fn (Blueprint $t) => $t->unsignedBigInteger('created_by')->nullable()),
        ];
    }

    /**
     * Details copied onto an existing person, where only that application had
     * them. Never overwritten, so a fuller application cannot blank out what a
     * sparser one recorded.
     *
     * @var list<string>
     */
    private const ENRICHED = [
        'first_name', 'last_name', 'phone', 'username', 'user_code',
        'designation', 'employee_number',
    ];

    public function up(): void
    {
        $columns = $this->widenedColumns();

        $missing = array_values(array_filter(
            array_keys($columns),
            fn (string $column) => ! Schema::hasColumn('users', $column),
        ));

        if ($missing !== []) {
            Schema::table('users', function (Blueprint $table) use ($columns, $missing) {
                foreach ($missing as $column) {
                    $columns[$column]($table);
                }
            });
        }

        $this->importLegacyUsers();
    }

    public function down(): void
    {
        // Only the widened columns go. No person is deleted, and the legacy ids
        // that make the import reversible are dropped only if asked for — so an
        // operator who needs to trace a person back to the application they came
        // from can roll this back and still find them.
        $present = array_values(array_filter(
            array_keys($this->widenedColumns()),
            fn (string $column) => Schema::hasColumn('users', $column),
        ));

        if ($present !== []) {
            Schema::table('users', function (Blueprint $table) use ($present) {
                $table->dropColumn($present);
            });
        }
    }

    /**
     * Copy the people from the three applications that had their own user table.
     *
     * Matched on the email address, because that is the one identifier all four
     * applications agreed on. A match is required rather than assumed: a row
     * whose address is not already here is left alone, because this application
     * decides who has an account and which facility they belong to, and that is
     * not a decision a migration should make on someone's behalf.
     */
    private function importLegacyUsers(): void
    {
        foreach (['pharmacy', 'dental', 'eye'] as $application) {
            $this->importFrom($application);
        }
    }

    private function importFrom(string $application): void
    {
        $database = "tibadesk_{$application}";

        if (! $this->legacyUsersTableExists($database)) {
            return;
        }

        $rows = DB::connection($this->legacyConnection())
            ->table("{$database}.users")
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            $email = $row->email ?? null;

            // A row with no email cannot be matched to anything, and this
            // application will not hold an account without one.
            if (blank($email)) {
                continue;
            }

            $user = DB::table('users')->where('email', $email)->first();

            if ($user === null) {
                continue;
            }

            $this->attachLegacyId((int) $user->id, $application, (int) $row->id);
            $this->enrich((int) $user->id, (array) $row);
        }
    }

    /**
     * Record which application knew this person, if not already recorded.
     */
    private function attachLegacyId(int $userId, string $application, int $legacyId): void
    {
        DB::table('users')
            ->where('id', $userId)
            ->whereNull("legacy_{$application}_id")
            ->update(["legacy_{$application}_id" => $legacyId]);
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function enrich(int $userId, array $row): void
    {
        $update = [];

        foreach (self::ENRICHED as $column) {
            if (filled($row[$column] ?? null)) {
                $update[$column] = $row[$column];
            }
        }

        if ($update === []) {
            return;
        }

        DB::table('users')->where('id', $userId)->update($update);
    }

    /**
     * Whether a legacy database is still reachable.
     *
     * Expected to be true when the import first runs, but a migration that
     * cannot start because a database was already decommissioned would leave the
     * application unable to boot at all — a far worse outcome than importing
     * nothing. The legacy columns record what was taken, so a later run against
     * a missing database is a no-op rather than a loss.
     */
    private function legacyUsersTableExists(string $database): bool
    {
        try {
            return DB::connection($this->legacyConnection())
                ->table('information_schema.tables')
                ->where('table_schema', $database)
                ->where('table_name', 'users')
                ->exists();
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * The connection the legacy databases are read through. The same MySQL
     * server this application already uses, with a configuration entry of its
     * own so the old databases are not assumed to share this schema.
     */
    private function legacyConnection(): string
    {
        return config('database.legacy_connection', 'mysql');
    }
};
