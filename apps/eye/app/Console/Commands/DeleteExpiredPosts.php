<?php

namespace App\Console\Commands;

use App\Models\Marketing\BlogPost;
use App\Models\Marketing\Announcement;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeleteExpiredPosts extends Command
{
    protected $signature = 'posts:delete-expired';

    protected $description = 'Delete blog posts and announcements older than 30 days';

    public function handle()
    {
        $cutoff = Carbon::now()->subDays(30);

        $deletedPosts = BlogPost::where('published_at', '<', $cutoff)->delete();
        $deletedAnnouncements = Announcement::where('published_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deletedPosts} expired blog posts and {$deletedAnnouncements} expired announcements.");
    }
}
