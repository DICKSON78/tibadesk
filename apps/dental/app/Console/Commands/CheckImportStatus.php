<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckImportStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:check-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the status of imported data from both SQL files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Checking import status...");
        $this->newLine();

        // Get all tables
        $tables = DB::select('SHOW TABLES');
        $tableNames = array_map(function($table) {
            return array_values((array)$table)[0];
        }, $tables);

        $this->table(
            ['Table Name', 'Record Count', 'Status'],
            collect($tableNames)->map(function($tableName) {
                try {
                    $count = DB::table($tableName)->count();
                    $status = $count > 0 ? '✓ Has Data' : '✗ Empty';
                    return [$tableName, $count, $status];
                } catch (\Exception $e) {
                    return [$tableName, 'Error', '✗ Error'];
                }
            })->toArray()
        );

        $this->newLine();
        $this->info("Summary:");
        $this->info("- Total tables: " . count($tableNames));
        $this->info("- Tables with data: " . collect($tableNames)->filter(function($tableName) {
            try {
                return DB::table($tableName)->count() > 0;
            } catch (\Exception $e) {
                return false;
            }
        })->count());
        
        return 0;
    }
}
