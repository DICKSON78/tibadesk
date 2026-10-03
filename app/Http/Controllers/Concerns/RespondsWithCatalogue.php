<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;

trait RespondsWithCatalogue
{
    /**
     * The published package catalogue, shaped for the marketing site.
     *
     * @return array<string, mixed>
     */
    protected function catalogueData(): array
    {
        $config = config('tibadesk');
        $modules = $config['modules'];

        $editions = collect($config['editions'])
            ->map(function (array $edition, string $key) use ($modules): array {
                $keys = $edition['modules'];

                return [
                    'key' => $key,
                    'name' => $edition['name'],
                    'tagline' => $edition['tagline'],
                    'highlighted' => $edition['highlighted'],
                    'limits' => $edition['limits'],
                    'module_keys' => $keys,
                    'modules' => array_map(
                        fn (string $moduleKey): array => [
                            'key' => $moduleKey,
                            'name' => $modules[$moduleKey]['name'],
                            'icon' => $modules[$moduleKey]['icon'],
                            'summary' => $modules[$moduleKey]['summary'],
                            'requirements' => $modules[$moduleKey]['requirements'],
                        ],
                        $keys,
                    ),
                ];
            })
            ->values()
            ->all();

        return [
            'on_premise' => true,
            'licence_terms' => $config['licence_terms'],
            'deployment' => $config['deployment'],
            'non_functional' => $config['non_functional'],
            'editions' => $editions,
            'all_modules' => array_merge($config['all_modules'], [
                'module_keys' => array_keys($modules),
                'modules' => array_values($modules),
            ]),
            'modules' => array_values($modules),
            'shared_modules' => array_map(
                fn (string $key): array => ['key' => $key, 'name' => $modules[$key]['name']],
                $config['shared_modules'],
            ),
        ];
    }

    protected function catalogue(): JsonResponse
    {
        return response()->json($this->catalogueData());
    }
}
