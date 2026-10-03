<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialMediaService
{
    public function sharePost($post, array $platforms = [])
    {
        $results = [];

        foreach ($platforms as $platform) {
            if ($platform === 'facebook') {
                $results['facebook'] = $this->postToFacebook($post);
            } elseif ($platform === 'instagram') {
                $results['instagram'] = $this->postToInstagram($post);
            }
        }

        return $results;
    }

    protected function buildMessage($post)
    {
        $title = $post->title;
        $excerpt = $post->excerpt ?? '';
        $url = url('/blog/' . $post->slug);

        $message = "{$title}\n\n{$excerpt}\n\nRead more: {$url}";
        return trim($message);
    }

    public function postToFacebook($post)
    {
        $token = config('services.facebook.page_token');
        $pageId = config('services.facebook.page_id');

        if (!$token || !$pageId) {
            Log::warning('Facebook credentials missing in config');
            return ['success' => false, 'error' => 'Facebook credentials not configured'];
        }

        $message = $this->buildMessage($post);
        $params = [
            'message' => $message,
            'access_token' => $token,
        ];

        if ($post->featured_image) {
            $imageBinary = $this->downloadImage($post->featured_image);
            if ($imageBinary) {
                $photoResp = Http::asMultipart()->post(
                    "https://graph.facebook.com/v20.0/{$pageId}/photos",
                    [
                        'message' => $message,
                        'access_token' => $token,
                        'source' => $imageBinary,
                    ]
                );

                if ($photoResp->successful()) {
                    return $this->parseResponse($photoResp, 'facebook');
                }
                Log::warning('Facebook binary photo post failed', ['response' => $photoResp->json()]);
            }

            $params['url'] = $post->featured_image;
            $response = Http::post("https://graph.facebook.com/v20.0/{$pageId}/photos", $params);

            if (!$response->successful()) {
                Log::warning('Facebook photo post failed, falling back to link post', ['response' => $response->json()]);
                $params['link'] = url('/blog/' . $post->slug);
                unset($params['url']);
                $response = Http::post("https://graph.facebook.com/v20.0/{$pageId}/feed", $params);
            }
        } else {
            $params['link'] = url('/blog/' . $post->slug);
            $response = Http::post("https://graph.facebook.com/v20.0/{$pageId}/feed", $params);
        }

        return $this->parseResponse($response, 'facebook');
    }

    protected function downloadImage($url)
    {
        if (!$url) return null;
        try {
            $response = Http::timeout(30)->withOptions(['allow_redirects' => true])->get($url);
            if (!$response->successful()) {
                Log::warning('Image download failed status', ['url' => $url, 'status' => $response->status()]);
                return null;
            }

            $tmp = tempnam(sys_get_temp_dir(), 'fbimg');
            if (!$tmp) return null;
            file_put_contents($tmp, $response->body());

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = $finfo ? finfo_file($finfo, $tmp) : 'image/jpeg';
            finfo_close($finfo);

            $ext = match ($mime) {
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'image/jpeg' => 'jpg',
                default => 'jpg',
            };

            $path = $tmp . '.' . $ext;
            rename($tmp, $path);

            $file = new \Illuminate\Http\UploadedFile(
                $path,
                basename($path),
                $mime,
                null,
                true
            );

            return $file;
        } catch (\Throwable $e) {
            Log::warning('Image download failed', ['url' => $url, 'error' => $e->getMessage()]);
        }
        return null;
    }

    public function postToInstagram($post)
    {
        $token = config('services.facebook.user_token');
        $igUserId = config('services.instagram.user_id');

        if (!$token || !$igUserId) {
            Log::warning('Instagram credentials missing in config');
            return ['success' => false, 'error' => 'Instagram credentials not configured'];
        }

        if (!$post->featured_image) {
            return ['success' => false, 'error' => 'Featured image required for Instagram'];
        }

        $caption = $post->title;
        if ($post->excerpt) {
            $caption .= "\n\n" . mb_substr($post->excerpt, 0, 100);
        }
        $caption .= "\n\nVisit us: " . url('/blog/' . $post->slug);

        $container = Http::post("https://graph.facebook.com/v20.0/{$igUserId}/media", [
            'image_url' => $post->featured_image,
            'caption' => mb_substr($caption, 0, 2200),
            'access_token' => $token,
        ]);

        $containerData = $container->json();

        if (!$container->successful() || empty($containerData['id'])) {
            Log::error('Instagram container creation failed', ['response' => $containerData]);
            return ['success' => false, 'error' => $containerData['error']['message'] ?? 'Container creation failed'];
        }

        $publish = Http::post("https://graph.facebook.com/v20.0/{$igUserId}/media_publish", [
            'creation_id' => $containerData['id'],
            'access_token' => $token,
        ]);

        return $this->parseResponse($publish, 'instagram');
    }

    public function deleteFromFacebook($postId)
    {
        $token = config('services.facebook.page_token');
        if (!$token || !$postId) {
            return ['success' => false, 'error' => 'Missing Facebook credentials or post id'];
        }

        $response = Http::delete("https://graph.facebook.com/v20.0/{$postId}", [
            'access_token' => $token,
        ]);

        return $this->parseDeleteResponse($response, 'facebook');
    }

    public function deleteFromInstagram($postId)
    {
        $token = config('services.facebook.user_token');
        if (!$token || !$postId) {
            return ['success' => false, 'error' => 'Missing Instagram credentials or post id'];
        }

        $response = Http::delete("https://graph.facebook.com/v20.0/{$postId}", [
            'access_token' => $token,
        ]);

        return $this->parseDeleteResponse($response, 'instagram');
    }

    public function deletePost($post)
    {
        $results = [];

        if ($post->shared_to_facebook) {
            $results['facebook'] = $this->deleteFromFacebook($post->shared_to_facebook);
        }

        if ($post->shared_to_instagram) {
            $results['instagram'] = $this->deleteFromInstagram($post->shared_to_instagram);
        }

        return $results;
    }

    public function deleteFromPlatform($post, $platform)
    {
        $postId = $post->{"shared_to_{$platform}"};
        if (!$postId) {
            return ['success' => false, 'error' => 'Not shared to ' . $platform];
        }

        if ($platform === 'facebook') {
            $result = $this->deleteFromFacebook($postId);
        } elseif ($platform === 'instagram') {
            $result = $this->deleteFromInstagram($postId);
        } else {
            return ['success' => false, 'error' => 'Unknown platform'];
        }

        if ($result['success']) {
            $post->update(["shared_to_{$platform}" => null]);
        }

        return $result;
    }

    protected function parseDeleteResponse($response, $platform)
    {
        $data = $response->json();

        if ($response->successful() && (($data['success'] ?? false) === true || isset($data['success']))) {
            Log::info("{$platform} deletion successful");
            return ['success' => true];
        }

        Log::warning("{$platform} deletion failed", ['response' => $data]);
        return ['success' => false, 'error' => $data['error']['message'] ?? 'Unknown error'];
    }

    protected function parseResponse($response, $platform)
    {
        $data = $response->json();

        if ($response->successful() && !empty($data['id'])) {
            Log::info("{$platform} post successful", ['id' => $data['id']]);
            return ['success' => true, 'post_id' => $data['id']];
        }

        Log::error("{$platform} post failed", ['response' => $data]);
        return ['success' => false, 'error' => $data['error']['message'] ?? 'Unknown error'];
    }
}
