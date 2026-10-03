<?php

namespace Database\Seeders;

use App\Models\Marketing\Announcement;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        // Seeding this twice used to abort on the first duplicate slug or name,
        // which meant the sample data below it never landed on a re-run.
        if (Announcement::query()->exists()) {
            return;
        }

        $announcements = [
            [
                'title' => 'Free Eye Screening Camp — June 2026',
                'description' => 'Join us for a free community eye screening at Natta Health Centre. Services include vision tests, glaucoma screening, and cataract checks.',
                'file_path' => '/downloads/free-screening-june-2026.pdf',
                'file_name' => 'Free_Screening_June_2026.pdf',
                'category' => 'Community',
                'published_at' => Carbon::now()->subDays(1),
            ],
            [
                'title' => 'New Extended Clinic Hours',
                'description' => 'Best Vision Eye Care is now open until 7 PM on weekdays and 4 PM on Saturdays for your convenience.',
                'file_path' => '/downloads/extended-hours.pdf',
                'file_name' => 'Extended_Hours.pdf',
                'category' => 'Clinic',
                'published_at' => Carbon::now()->subDays(4),
            ],
            [
                'title' => 'School Vision Screening Program 2026',
                'description' => 'We are partnering with local primary schools to provide free vision screenings for children. Schools can register by contacting us.',
                'file_path' => '/downloads/school-screening-program.pdf',
                'file_name' => 'School_Screening_2026.pdf',
                'category' => 'Community',
                'published_at' => Carbon::now()->subDays(7),
            ],
            [
                'title' => 'Notice: Annual Maintenance Closure',
                'description' => 'Our clinic will be closed on August 15-16 for annual equipment maintenance. Emergency services will be available at nearby partner clinics.',
                'file_path' => '/downloads/maintenance-closure-notice.pdf',
                'file_name' => 'Maintenance_Closure.pdf',
                'category' => 'Notice',
                'published_at' => Carbon::now()->subDays(10),
            ],
            [
                'title' => 'New Glaucoma Treatment Service Launch',
                'description' => 'Best Vision is proud to announce the launch of our advanced glaucoma treatment services, including laser therapy and minimally invasive surgery.',
                'file_path' => '/downloads/glaucoma-service-launch.pdf',
                'file_name' => 'Glaucoma_Service_Launch.pdf',
                'category' => 'Services',
                'published_at' => Carbon::now()->subDays(14),
            ],
            [
                'title' => 'Partnership with Mwanza Regional Hospital',
                'description' => 'We have entered a referral partnership with Mwanza Regional Hospital to provide specialized eye care services for complex cases.',
                'file_path' => null,
                'file_name' => null,
                'category' => 'Clinic',
                'published_at' => Carbon::now()->subDays(20),
            ],
        ];

        foreach ($announcements as $a) {
            Announcement::create($a + ['status' => 'published']);
        }

        $this->command->info('Announcements seeded successfully!');
    }
}
