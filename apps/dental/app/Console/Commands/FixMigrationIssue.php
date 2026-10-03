<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixMigrationIssue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migration:fix-stocktake';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix the stocktake_items migration issue';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== FIXING MIGRATION ISSUE ===');
        $this->newLine();

        try {
            // Check if stocktake_items table exists
            if (!Schema::hasTable('stocktake_items')) {
                $this->error('❌ stocktake_items table does not exist!');
                return 1;
            }

            // Get current columns
            $this->info('1. Checking current table structure...');
            $columns = DB::select('SHOW COLUMNS FROM stocktake_items');
            $columnNames = array_column($columns, 'Field');
            
            $this->info('Current columns in stocktake_items:');
            foreach ($columns as $column) {
                $this->info("  - {$column->Field} ({$column->Type})");
            }
            $this->newLine();

            // Check if the problematic columns exist
            $hasSellingPrice = in_array('selling_price', $columnNames);
            $hasExpirationDate = in_array('expiration_date', $columnNames);

            $this->info('2. Checking for problematic columns...');
            $this->info("selling_price exists: " . ($hasSellingPrice ? 'YES' : 'NO'));
            $this->info("expiration_date exists: " . ($hasExpirationDate ? 'YES' : 'NO'));
            $this->newLine();

            if ($hasSellingPrice && $hasExpirationDate) {
                $this->info('3. Both columns already exist. Marking migration as completed...');
                
                // Mark the migration as completed in the migrations table
                $migrationName = '2025_08_18_170032_add_selling_price_and_expiration_to_stocktake_items_table';
                $exists = DB::table('migrations')->where('migration', $migrationName)->exists();
                
                if (!$exists) {
                    DB::table('migrations')->insert([
                        'migration' => $migrationName,
                        'batch' => DB::table('migrations')->max('batch') + 1
                    ]);
                    $this->info('✅ Migration marked as completed');
                } else {
                    $this->info('✅ Migration already marked as completed');
                }
                
            } else {
                $this->info('3. Columns missing. Adding them...');
                
                if (!$hasSellingPrice) {
                    DB::statement('ALTER TABLE stocktake_items ADD COLUMN selling_price DOUBLE UNSIGNED NULL AFTER unit_buying_price');
                    $this->info('✅ Added selling_price column');
                }
                
                if (!$hasExpirationDate) {
                    DB::statement('ALTER TABLE stocktake_items ADD COLUMN expiration_date DATE NULL AFTER selling_price');
                    $this->info('✅ Added expiration_date column');
                }
                
                // Mark migration as completed
                $migrationName = '2025_08_18_170032_add_selling_price_and_expiration_to_stocktake_items_table';
                DB::table('migrations')->insert([
                    'migration' => $migrationName,
                    'batch' => DB::table('migrations')->max('batch') + 1
                ]);
                $this->info('✅ Migration marked as completed');
            }

            $this->newLine();
            $this->info('=== MIGRATION ISSUE FIXED ===');
            $this->info('✅ You can now run "php artisan migrate" successfully');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
