<?php

namespace Database\Seeders;

use App\Models\Marketing\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Seeding this twice used to abort on the first duplicate slug or name,
        // which meant the sample data below it never landed on a re-run.
        if (Category::query()->exists()) {
            return;
        }

        $categories = [
            ['name' => 'Community', 'description' => 'Community outreach and events'],
            ['name' => 'Clinic', 'description' => 'Clinic updates and announcements'],
            ['name' => 'Notice', 'description' => 'Important notices and alerts'],
            ['name' => 'Services', 'description' => 'New and existing service announcements'],
            ['name' => 'General', 'description' => 'General announcements'],
        ];

        foreach ($categories as $c) {
            Category::create($c);
        }

        $this->command->info('Categories seeded successfully!');
    }
}
