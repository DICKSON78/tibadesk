<?php

declare(strict_types=1);

namespace App\EmbeddedApps;

use GuzzleHttp\Psr7\Uri;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Forwards a request under /apps/{key}/… to the package that owns it.
 *
 * The three packages are separate applications with their own processes. The
 * mount makes them look like part of this one by rewriting the request on the
 * way in and the response on the way out, so a user only ever sees a single
 * origin, a single port, and a single set of URLs.
 *
 * On the way in the mount prefix is stripped, because the package's own router
 * knows nothing about TibaDesk and would 404 on a path it does not own. On the
 * way out every URL the package generated is rewritten back under the mount,
 * because those URLs were absolute and would otherwise point at the TibaDesk
 * root — where a package's own /api or /dashboard would be answered by this
 * application instead of by the package it belongs to.
 *
 * The forwarded request keeps the user's own cookies rather than the package's
 * session, so a package never sees a TibaDesk cookie. Sign-in is handled
 * separately by the SSO broker, which is what actually establishes the package
 * session; this class is only responsible for not leaking this application's
 * cookies across the boundary.
 */
class ReverseProxy
{
    /**
     * Headers that describe the connection between the browser and this
     * application, or this application's own routing, and so must not be
     * forwarded as-is: the package has its own opinion about all of them.
     */
    private const STRIPPED_REQUEST_HEADERS = [
        'host',
        'connection',
        'content-length',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',
        'cookie',
        'x-forwarded-host',
        'x-forwarded-proto',
        'x-forwarded-for',
        'x-forwarded-port',
        'x-inertia',
        'x-requested-with',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
    ];

    /**
     * Response headers that would either be meaningless on the far side or
     * actively harmful if re-emitted here: a content length computed for the
     * package's own body, or a location that still points at the internal port
     * the browser cannot reach.
     */
    private const STRIPPED_RESPONSE_HEADERS = [
        'content-length',
        'content-encoding',
        'transfer-encoding',
        'connection',
        'keep-alive',
        'set-cookie',
    ];

    /**
     * Root-relative paths that belong to this application rather than to the
     * package that emitted them, and so must not be pushed under the mount.
     *
     * /tibadesk leads because that is where this application lives: a package
     * linking to the application's own screens means to leave the mount, and
     * prefixing those would produce /tibadesk/apps/dental/tibadesk/patients.
     */
    private const RESERVED_PREFIXES = [
        '/tibadesk/',
        '/tibadesk',
        '/api/',
        '/sanctum/',
        '/storage/',
        '/up/',
        '/_inertia/',
    ];

    /**
     * Where a package's own /login and /logout actually live.
     *
     * A package redirects to /login when a session has ended. Those pages are
     * this application's, and it keeps them under /tibadesk, so the redirect is
     * mapped rather than either prefixed into the mount or left to fall through
     * to the marketing site that now owns the root.
     */
    private const SESSION_REDIRECTS = [
        'login' => '/tibadesk/login',
        'logout' => '/tibadesk/logout',
    ];

    public function __construct(private readonly HttpFactory $http) {}

    /**
     * Build the upstream URL for a mounted request.
     *
     * A path that is empty or is just the mount itself maps to the package
     * root, so /tibadesk/apps/dental and /tibadesk/apps/dental/ both reach it,
     * rather than 404ing on a stray trailing slash.
     */
    public function upstreamUri(string $key, string $mount, string $path, array $query): string
    {
        $origin = rtrim((string) config("embedded_apps.{$key}.origin"), '/');
        $path = '/'.ltrim($path, '/');

        $uri = (new Uri($origin))->withPath(rtrim($path, '/') ?: '/');

        if ($query !== []) {
            $uri = $uri->withQuery(http_build_query($query));
        }

        return (string) $uri;
    }

    /**
     * Forward a mounted request and return the package's answer.
     *
     * @throws ConnectionException when the package cannot be reached, which
     *                             the caller turns into a 502 rather than a
     *                             blank frame.
     */
    public function forward(Request $request, string $key, string $mount, string $path): SymfonyResponse
    {
        $target = $this->upstreamUri($key, $mount, $path, $request->query());

        try {
            $response = $this->http
                ->withHeaders($this->forwardableHeaders($request))
                ->withOptions(['allow_redirects' => false, 'http_errors' => false])
                ->send($request->method(), $target, [
                    'body' => $this->body($request),
                ]);
        } catch (ConnectionException $exception) {
            Log::error('Embedded application is unreachable.', [
                'app' => $key,
                'target' => $target,
                'error' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        return $this->relay($response, $key, $mount);
    }

    /**
     * Turn a package response into one this application can send, rewriting
     * everything that still refers to the internal origin.
     */
    private function relay(Response $response, string $key, string $mount): SymfonyResponse
    {
        $headers = [];

        foreach ($response->headers() as $name => $values) {
            if (in_array(strtolower($name), self::STRIPPED_RESPONSE_HEADERS, true)) {
                continue;
            }

            $headers[$name] = count($values) === 1
                ? $this->rewriteHeader($values[0], $key, $mount)
                : array_map(fn (string $value): string => $this->rewriteHeader($value, $key, $mount), $values);
        }

        $status = $response->status();

        // A redirect is followed by the browser against this origin, so its
        // Location has to come back under the mount or the user would be
        // dropped at the TibaDesk root the moment a package redirected.
        if ($status >= 300 && $status < 400 && $response->header('Location') !== '') {
            $location = $this->rewriteUrl($response->header('Location'), $key, $mount);

            unset($headers['Location']);

            return new RedirectResponse($location, $status, $headers);
        }

        $contentType = $response->header('Content-Type');

        // Binary assets are passed through untouched. They contain no URLs that
        // need rewriting, and rewriting them would corrupt hashes and source
        // maps for no benefit.
        if ($contentType !== '' && ! $this->isRewritable($contentType)) {
            return new SymfonyResponse($response->body(), $status, $headers);
        }

        // Rewritten here rather than streamed, so the body is inspectable in
        // tests and available to anything downstream that reads it. A package
        // response is bounded by the size of a page, not of a file.
        return new SymfonyResponse(
            $this->rewriteBody($response->body(), $key, $mount),
            $status,
            $headers,
        );
    }

    /**
     * Only textual documents carry URLs worth rewriting.
     */
    private function isRewritable(string $contentType): bool
    {
        return str_contains($contentType, 'text/html')
            || str_contains($contentType, 'application/json')
            || str_contains($contentType, 'application/javascript')
            || str_contains($contentType, 'text/javascript')
            || str_contains($contentType, 'text/plain')
            || str_contains($contentType, 'text/css');
    }

    /**
     * Rewrite every reference to the package's own root so it stays inside the
     * mount.
     *
     * Two shapes have to be handled: a full URL to the internal origin, and a
     * root-relative path. Both are produced in quantity by a Laravel
     * application that has been told the wrong APP_URL, and both would
     * otherwise resolve against the TibaDesk origin and hit this application's
     * routes rather than the package's.
     */
    private function rewriteBody(string $body, string $key, string $mount): string
    {
        $origin = rtrim((string) config("embedded_apps.{$key}.origin"), '/');

        // An absolute URL to the internal origin collapses to the mount, so
        // http://127.0.0.1:8012/reception becomes /tibadesk/apps/dental/reception.
        $body = str_replace($origin, $mount, $body);

        // A protocol-relative form of the same, for the rare package that
        // emits one.
        $body = str_replace('//'.parse_url($origin, PHP_URL_HOST).':'.parse_url($origin, PHP_URL_PORT), $mount, $body);

        // Root-relative references are the hard case: a leading slash inside a
        // document means the site root, which after mounting is the package
        // root, not the TibaDesk root. Left alone, an <img src="/build/…"> or a
        // fetch("/api/…") inside a package would resolve against TibaDesk and
        // be answered by this application.
        //
        // Only two things carry a root-relative URL in a document: a quoted
        // attribute value (href, src, action) and a CSS url(). Rewriting those
        // and nothing else is deliberate — a bare slash also appears in dates,
        // arithmetic and prose, and a pattern loose enough to catch those would
        // quietly corrupt text a user can read.
        $body = preg_replace_callback(
            '~(?P<q>["\'])(?P<url>/(?!/)[A-Za-z0-9_\-./%?&=+\#]*)(?P=q)~',
            fn (array $matches): string => $this->prefixed($matches['q'], $matches['url'], $mount),
            $body,
        ) ?? $body;

        $body = preg_replace_callback(
            '~url\(\s*(?P<q>["\']?)(?P<url>/(?!/)[A-Za-z0-9_\-./%?&=+\#]*)(?P=q)\s*\)~i',
            fn (array $matches): string => 'url('.$this->prefixed($matches['q'], $matches['url'], $mount).')',
            $body,
        ) ?? $body;

        return $body;
    }

    /**
     * Put the mount in front of a root-relative URL, unless the URL already
     * belongs to this application or is already mounted.
     *
     * The exclusion list is the TibaDesk side of the boundary: /tibadesk, /api
     * and the rest are this application's own namespaces, and a package that
     * links to one of them means to leave the mount, not to deepen it. Rewriting
     * those would send a package's link to /tibadesk/patients/… into a second
     * copy of the mount.
     */
    private function prefixed(string $quote, string $url, string $mount): string
    {
        if (str_starts_with($url, $mount.'/') || $url === $mount) {
            return $quote.$url.$quote;
        }

        foreach (self::RESERVED_PREFIXES as $reserved) {
            if (str_starts_with($url, $reserved)) {
                return $quote.$url.$quote;
            }
        }

        return $quote.$mount.$url.$quote;
    }

    private function rewriteHeader(string $value, string $key, string $mount): string
    {
        return $this->rewriteUrl($value, $key, $mount);
    }

    private function rewriteUrl(string $url, string $key, string $mount): string
    {
        $origin = rtrim((string) config("embedded_apps.{$key}.origin"), '/');

        if (str_starts_with($url, $origin)) {
            return $mount.substr($url, strlen($origin));
        }

        if (str_starts_with($url, $mount)) {
            return $url;
        }

        // A relative redirect such as /login is resolved against the package
        // origin by the browser only if it stays relative to the current
        // mount, which it does not: a leading slash is absolute to the site
        // root. Anything the package means as its own root has to come back
        // under the mount.
        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            // A package signing a user out, or sending one to sign in, means
            // this application's session and not its own — and this application
            // moved both pages under /tibadesk when the public website took the
            // root. Left alone, a package's redirect to /login would arrive at
            // the marketing site, which has a page of its own there.
            if (preg_match('~^/(login|logout)\b~', $url, $matches) === 1) {
                return self::SESSION_REDIRECTS[$matches[1]].substr($url, strlen($matches[0]));
            }

            foreach (self::RESERVED_PREFIXES as $prefix) {
                if (str_starts_with($url, $prefix)) {
                    return $url;
                }
            }

            return $mount.$url;
        }

        return $url;
    }

    /**
     * @return array<string, string>
     */
    private function forwardableHeaders(Request $request): array
    {
        $headers = [];

        foreach ($request->headers->all() as $name => $values) {
            $lower = strtolower($name);

            if (in_array($lower, self::STRIPPED_REQUEST_HEADERS, true)) {
                continue;
            }

            $headers[$name] = implode(', ', $values);
        }

        return $headers;
    }

    private function body(Request $request): string
    {
        $content = $request->getContent();

        return is_string($content) ? $content : '';
    }
}
