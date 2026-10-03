<?php

namespace App\Console\Commands;

use App\Models\Marketing\BlogPost;
use Illuminate\Console\Command;

class CleanOldBlogPosts extends Command
{
    protected $signature = 'blog:clean-old';

    protected $description = 'Delete blog posts and announcements older than 1 month';

    public function handle()
    {
        $cutoff = now()->subMonth();

        $deleted = BlogPost::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} blog post(s) older than 1 month.");
    }
}
