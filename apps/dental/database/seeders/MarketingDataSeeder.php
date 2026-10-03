<?php

namespace Database\Seeders;

use App\Models\Marketing\CommunicationLog;
use App\Models\Marketing\DailyActivity;
use App\Models\Marketing\Event;
use App\Models\Marketing\Idea;
use App\Models\Marketing\InformationSource;
use App\Models\Marketing\MarketingStrategy;
use App\Models\Marketing\ResearchPlan;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MarketingDataSeeder extends Seeder
{
    public function run()
    {
        // Get a user to associate with the data
        $user = User::first();
        if (!$user) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        // Create Information Sources if they don't exist
        $informationSources = [
            'Social Media' => 'Facebook, Instagram, Twitter',
            'Word of Mouth' => 'Patient referrals and recommendations',
            'Radio Advertisement' => 'Local radio station ads',
            'Newspaper' => 'Local newspaper advertisements',
            'Billboard' => 'Outdoor billboard advertising',
            'Website' => 'Online presence and website',
            'Google Search' => 'Search engine optimization',
            'Television' => 'TV commercials and programs',
            'Community Events' => 'Health fairs and community outreach',
            'Healthcare Referrals' => 'Referrals from other healthcare providers'
        ];

        foreach ($informationSources as $name => $description) {
            InformationSource::firstOrCreate(
                ['name' => $name],
                [
                    'clinic_id' => $user->clinic_id,
                    'description' => $description,
                    'status' => 'Active'
                ]
            );
        }

        // Create Daily Activities
        $dailyActivities = [
            'Social Media Content Creation' => 'Created engaging posts for Facebook and Instagram',
            'Patient Follow-up Calls' => 'Called patients for follow-up appointments',
            'Community Health Talk' => 'Conducted eye health awareness session',
            'Marketing Material Distribution' => 'Distributed brochures in local areas',
            'Website Content Update' => 'Updated website with new services',
            'Radio Advertisement Script' => 'Prepared radio advertisement content',
            'Patient Satisfaction Survey' => 'Conducted patient satisfaction survey',
            'Local Business Partnership' => 'Met with local businesses for partnerships',
            'Health Fair Preparation' => 'Prepared materials for upcoming health fair',
            'Social Media Analytics Review' => 'Reviewed social media performance metrics'
        ];

        foreach ($dailyActivities as $description => $remarks) {
            DailyActivity::create([
                'activity_date' => Carbon::now()->subDays(rand(1, 30)),
                'description' => $description,
                'remarks' => $remarks,
                'status' => rand(0, 1) ? 'Completed' : 'Pending',
                'created_by' => $user->id,
                'completed_at' => rand(0, 1) ? Carbon::now()->subDays(rand(1, 30)) : null,
                'completed_by' => rand(0, 1) ? $user->id : null,
            ]);
        }

        // Create Ideas (using description field instead of title)
        $ideas = [
            'Mobile Eye Screening Unit - Develop a mobile unit for remote areas',
            'Loyalty Program for Patients - Create a rewards system for regular patients',
            'Telemedicine Integration - Implement online consultation services',
            'Partnership with Schools - Collaborate with schools for student eye health',
            'Seasonal Promotional Campaigns - Create campaigns for different seasons',
            'Patient Education Videos - Develop educational content for patients',
            'Social Media Influencer Collaboration - Partner with local influencers',
            'Corporate Wellness Programs - Offer eye care services to companies',
            'Community Health Workshops - Regular workshops in community centers',
            'Digital Marketing Automation - Automate social media and email marketing'
        ];

        foreach ($ideas as $description) {
            Idea::create([
                'description' => $description,
                'status' => ['Pending', 'Under Review', 'Approved', 'Implemented'][rand(0, 3)],
                'created_by' => $user->id,
            ]);
        }

        // Create Events (Outreach Programmes)
        $events = [
            'Community Eye Health Fair' => 'Free eye screening for community members',
            'School Vision Screening Program' => 'Eye health check for school children',
            'Senior Citizens Eye Care Day' => 'Specialized care for elderly patients',
            'Diabetes and Eye Health Seminar' => 'Educational seminar on diabetes eye complications',
            'World Sight Day Celebration' => 'Awareness campaign for World Sight Day',
            'Rural Area Eye Screening' => 'Mobile screening in remote villages',
            'Corporate Eye Health Workshop' => 'Workplace eye health awareness',
            'Children Eye Health Campaign' => 'Focus on pediatric eye care',
            'Glaucoma Awareness Month' => 'Month-long glaucoma awareness campaign',
            'Eye Safety at Work Seminar' => 'Workplace eye safety training'
        ];

        foreach ($events as $title => $description) {
            Event::create([
                'title' => $title,
                'description' => $description,
                'event_type' => 'Outreach Programme',
                'event_date' => Carbon::now()->addDays(rand(1, 90)),
                'location' => 'Various locations',
                'status' => ['Scheduled', 'In Progress', 'Completed', 'Cancelled'][rand(0, 3)],
                'created_by' => $user->id,
            ]);
        }

        // Create Communication Logs
        $communicationTypes = ['Phone Call', 'Email', 'SMS', 'Social Media', 'In-Person Meeting'];
        $communicationDirections = ['Inbound', 'Outbound'];
        $customerNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Robert Miller', 'Emily Garcia', 'James Rodriguez', 'Maria Martinez'];

        for ($i = 0; $i < 20; $i++) {
            CommunicationLog::create([
                'customer_name' => $customerNames[rand(0, 9)],
                'customer_phone' => '+255' . rand(700000000, 799999999),
                'customer_email' => 'customer' . ($i + 1) . '@example.com',
                'communication_type' => $communicationTypes[rand(0, 4)],
                'communication_direction' => $communicationDirections[rand(0, 1)],
                'description' => 'Marketing communication for eye care services',
                'created_by' => $user->id,
            ]);
        }

        // Create Marketing Strategies
        $strategies = [
            'Digital Marketing Campaign' => 'Comprehensive online marketing strategy',
            'Community Outreach Program' => 'Local community engagement strategy',
            'Patient Referral System' => 'System to encourage patient referrals',
            'Brand Awareness Campaign' => 'Building clinic brand recognition',
            'Seasonal Promotional Strategy' => 'Year-round promotional activities'
        ];

        foreach ($strategies as $title => $overview) {
            MarketingStrategy::create([
                'title' => $title,
                'overview' => $overview,
                'goals' => 'Increase patient base and improve community health awareness',
                'target_audience' => 'Local community, existing patients, and potential referrals',
                'budget' => rand(500000, 2000000),
                'channels' => 'Social media, radio, community events, partnerships',
                'status' => ['Active', 'Completed', 'On Hold'][rand(0, 2)],
                'created_by' => $user->id,
            ]);
        }

        // Create Research Plans
        $researchPlans = [
            'Patient Satisfaction Study' => 'Comprehensive patient satisfaction research',
            'Market Analysis for New Services' => 'Research on potential new eye care services',
            'Competitor Analysis' => 'Study of local eye care providers',
            'Community Health Needs Assessment' => 'Assessment of community eye health needs',
            'Digital Marketing Effectiveness Study' => 'Research on digital marketing ROI'
        ];

        foreach ($researchPlans as $title => $overview) {
            ResearchPlan::create([
                'title' => $title,
                'overview' => $overview,
                'goals' => 'Understand market needs and improve service delivery',
                'deliverables' => 'Research report with recommendations',
                'target_audience' => 'Patients, community members, healthcare providers',
                'sample_plan' => 'Random sampling of 200 participants',
                'research_methods' => 'Surveys, interviews, and data analysis',
                'timeline' => rand(30, 90) . ' days',
                'budget' => rand(200000, 1000000),
                'status' => ['Planning', 'In Progress', 'Completed', 'On Hold'][rand(0, 3)],
                'created_by' => $user->id,
            ]);
        }

        // Update some patients with information sources
        $infoSources = InformationSource::all();
        $patients = Patient::take(50)->get();
        
        foreach ($patients as $patient) {
            $patient->update([
                'info_source_id' => $infoSources->random()->id
            ]);
        }

        $this->command->info('Marketing data seeded successfully!');
    }
}
